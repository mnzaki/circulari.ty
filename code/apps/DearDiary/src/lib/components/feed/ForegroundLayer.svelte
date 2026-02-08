<script lang="ts">
  import CreationTools from './CreationTools.svelte';
  import ViewReel from '$lib/components/views/ViewReel.svelte';
  import ErrorBoundary from '../ErrorBoundary.svelte';
  import { loadSessionState, foregroundPosition, saveForegroundPosition, saveActiveInput } from '$lib/stores/session.svelte';
  import { loadViews } from '$lib/stores/views.svelte';
  import type { InputType } from '@repo/persistence';

  // Configuration
  const PEEK_POSITION_VH = 15;
  const FULL_POSITION_VH = 0;
  const TOP_SNAP_VH = 15;
  const BOTTOM_SNAP_VH = 85;
  const DRAG_RESISTANCE = 0.85;
  const MIN_FEED_VISIBLE_VH = 15;
  
  // State - restored from session
  let translateY = $state(foregroundPosition());
  let isDragging = $state(false);
  let startClientY = $state(0);
  let startTranslateY = $state(foregroundPosition());
  let windowHeight = $state(0);
  let activeInput = $state<InputType>(null);

  let maxTranslateVh = $derived(100 - MIN_FEED_VISIBLE_VH);

  // Load session state on mount (only once)
  let mounted = $state(false);
  $effect(() => {
    if (!mounted) {
      mounted = true;
      loadSessionState().then(() => {
        translateY = foregroundPosition();
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
        saveForegroundPosition(translateY);
      }, 100);
    }
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
    saveForegroundPosition(translateY);
  }

  function handleActivateInput(type: InputType) {
    activeInput = type;
    saveActiveInput(type);
  }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div 
  class="foreground-layer"
  class:dragging={isDragging}
  style="transform: translateY({translateY}vh)"
>
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
