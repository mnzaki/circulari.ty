<script lang="ts">
  import { fade } from 'svelte/transition';
  import CreationTools from './CreationTools.svelte';
  import ViewReel from '$lib/components/views/ViewReel.svelte';
  import ErrorBoundary from '../ErrorBoundary.svelte';
  import { 
    getForegroundPosition, 
    setForegroundPosition, 
    setActiveInput,
    loadSessionState 
  } from '$lib/stores/sessionState.svelte';
  import { loadViews } from '$lib/stores/views.svelte';
  import type { InputType } from '@o19/foundframe-front';

  // Props
  interface Props {
    /** Called when QR scan mode should be enabled (foreground pulled > 50%) */
    onQrScanModeChange?: (enabled: boolean) => void;
    /** Called when a QR code is detected - for pairing flow */
    onQrDetected?: (content: string) => void;
    /** Called when position changes - for positioning overlays */
    onPositionChange?: (positionVh: number) => void;
    /** Called when pair button is clicked (desktop only) */
    onPairClick?: () => void;
    /** Whether pairing is in progress */
    isPairing?: boolean;
  }

  let { 
    onQrScanModeChange,
    onQrDetected,
    onPositionChange,
    onPairClick,
    isPairing = false
  }: Props = $props();

  // Configuration
  const PEEK_POSITION_VH = 15;
  const FULL_POSITION_VH = 0;
  const TOP_SNAP_VH = 15;
  const BOTTOM_SNAP_VH = 85;
  const DRAG_RESISTANCE = 0.85;
  const MIN_FEED_VISIBLE_VH = 15;
  const QR_SCAN_THRESHOLD_VH = 50; // Enable QR scanning when pulled down > 50%
  
  // State - restored from session
  let translateY = $state(getForegroundPosition());
  let isDragging = $state(false);
  let startClientY = $state(0);
  let startTranslateY = $state(getForegroundPosition());
  let windowHeight = $state(0);
  let activeInput = $state<InputType>(null);
  let isQrScanMode = $state(false);

  let maxTranslateVh = $derived(100 - MIN_FEED_VISIBLE_VH);

  // Load session state on mount (only once)
  let mounted = $state(false);
  $effect(() => {
    if (!mounted) {
      mounted = true;
      loadSessionState().then(() => {
        translateY = getForegroundPosition();
      }).catch(err => console.error('Failed to load session:', err));
      loadViews().catch(err => console.error('Failed to load views:', err));
    }
  });

  // Persist position when it changes (debounced slightly)
  let positionTimeout: ReturnType<typeof setTimeout>;
  $effect(() => {
    clearTimeout(positionTimeout);
    if (!isDragging) {
      positionTimeout = setTimeout(() => {
        setForegroundPosition(translateY);
      }, 100);
    }
  });

  // Track QR scan mode based on position
  $effect(() => {
    const shouldBeQrMode = translateY > QR_SCAN_THRESHOLD_VH;
    if (shouldBeQrMode !== isQrScanMode) {
      isQrScanMode = shouldBeQrMode;
      onQrScanModeChange?.(shouldBeQrMode);
      console.log('[ForegroundLayer] QR scan mode:', shouldBeQrMode ? 'enabled' : 'disabled');
    }
  });

  // Notify parent of position changes
  $effect(() => {
    onPositionChange?.(translateY);
  });

  function handleDragHandlePointerDown(e: PointerEvent) {
    // Don't drag if clicking interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) return;
    
    isDragging = true;
    startClientY = e.clientY;
    startTranslateY = translateY;
    
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startClientY;
    const deltaVh = (deltaY / windowHeight) * 100;
    let newTranslateY = startTranslateY + deltaVh * DRAG_RESISTANCE;
    newTranslateY = Math.max(FULL_POSITION_VH, Math.min(newTranslateY, maxTranslateVh));
    translateY = newTranslateY;
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    
    if (translateY < TOP_SNAP_VH) {
      translateY = FULL_POSITION_VH;
    } else if (translateY > BOTTOM_SNAP_VH) {
      translateY = PEEK_POSITION_VH;
    }
    
    // Save final position
    setForegroundPosition(translateY);
  }

  function handleActivateInput(type: InputType) {
    activeInput = type;
    setActiveInput(type);
  }

  /** Programmatically snap to a specific position */
  export function snapTo(position: 'full' | 'peek' | 'qr-scan') {
    switch (position) {
      case 'full':
        translateY = FULL_POSITION_VH;
        break;
      case 'peek':
        translateY = PEEK_POSITION_VH;
        break;
      case 'qr-scan':
        // Position for optimal QR scanning (about 60% down)
        translateY = 60;
        break;
    }
    setForegroundPosition(translateY);
  }

  /** Get current position */
  export function getPosition() {
    return {
      translateY,
      isQrScanMode,
      isFullyOpen: translateY === FULL_POSITION_VH,
      isPeek: translateY === PEEK_POSITION_VH
    };
  }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div 
  class="foreground-layer"
  class:dragging={isDragging}
  class:qr-scan-mode={isQrScanMode}
  style="transform: translateY({translateY}vh)"
>
  <slot></slot>
  <!-- QR Scan Mode Indicator - Shows when pulled down for scanning -->
  {#if isQrScanMode}
    <div class="qr-scan-indicator" transition:fade={{ duration: 200 }}>
      <div class="qr-scan-pulse"></div>
      <span class="qr-scan-text">Scanning for QR codes...</span>
    </div>
  {/if}

  <!-- Creation Tools - Draggable area containing CCCB, tabs, and inline input -->
  <div 
    class="creation-tools"
    onpointerdown={handleDragHandlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <!-- Drag Indicator -->
    <div class="drag-indicator"></div>
    
    <!-- Creation Tools: CCCB + Tab Bar + Inline Input -->
    <CreationTools 
      {activeInput}
      onActivateInput={handleActivateInput}
      {onPairClick}
      {isPairing}
    />
    
    <!-- Divider -->
    <div class="tools-feed-divider"></div>
  </div>

  <!-- View Reel - Contains The Feed™ and Child Views -->
  <div class="view-reel-container">
    <ErrorBoundary>
      <ViewReel />
    </ErrorBoundary>
  </div>
</div>

<style>
  .foreground-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: #f8f8f8;
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .foreground-layer.dragging {
    transition: none;
  }

  .foreground-layer.qr-scan-mode {
    /* Subtle visual cue when in QR scan mode */
    box-shadow: 0 -4px 30px rgba(100, 200, 100, 0.15);
    /* Make background transparent so camera shows through when pulled down */
    background: transparent;
  }

  /* QR Scan Mode Indicator */
  .qr-scan-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: linear-gradient(180deg, rgba(100, 200, 100, 0.1) 0%, transparent 100%);
    pointer-events: none;
    z-index: 10;
  }

  .qr-scan-pulse {
    width: 8px;
    height: 8px;
    background: #64c864;
    border-radius: 50%;
    animation: pulse-dot 1.5s ease-in-out infinite;
  }

  .qr-scan-text {
    font-size: 12px;
    color: #4a9a4a;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  @keyframes pulse-dot {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.3);
      opacity: 0.7;
    }
  }

  /* Creation Tools - The draggable handle containing everything */
  .creation-tools {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(180deg, #ffffff 0%, #f8f8f8 100%);
    border-radius: 24px 24px 0 0;
    touch-action: none;
    user-select: none;
    padding-top: 12px;
    padding-bottom: 8px;
  }

  .drag-indicator {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .foreground-layer.qr-scan-mode .drag-indicator {
    background: linear-gradient(90deg, #ddd, #64c864, #ddd);
  }

  .tools-feed-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent 10%, rgba(0,0,0,0.08) 50%, transparent 90%);
    margin-top: 8px;
  }

  /* View Reel Container */
  .view-reel-container {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
</style>
