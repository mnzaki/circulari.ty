<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    getCameraEnabled, 
    setCameraEnabled, 
    getHandedness,
    setHandedness 
  } from '$lib/stores/sessionState.svelte';
  import { stopCamera, startCamera } from '@o19/foundframe-tauri';
  import { isAndroid } from '$lib/stores/app.svelte';

  interface Props {
    /** Current camera mode */
    mode?: 'preview' | 'qr' | 'photo';
    /** Called when camera is toggled */
    onCameraToggle?: (enabled: boolean) => void;
    /** Whether to hide the tools (e.g., when foreground is pulled down) */
    hidden?: boolean;
    /** Current foreground position in vh - tools move with it */
    foregroundPositionVh?: number;
  }

  let { mode = 'preview', onCameraToggle, hidden = false, foregroundPositionVh = 15 }: Props = $props();

  // State
  let cameraEnabled = $state(getCameraEnabled());
  let handedness = $state(getHandedness());
  let isVisible = $state(true);

  // Toggle camera on/off completely
  async function toggleCamera() {
    if (!isAndroid()) return;

    const newEnabled = !cameraEnabled;
    
    try {
      if (newEnabled) {
        // Start camera
        await startCamera({ mode, cameraDirection: 'back' });
      } else {
        // Stop camera completely
        await stopCamera();
      }
      
      cameraEnabled = newEnabled;
      setCameraEnabled(newEnabled);
      onCameraToggle?.(newEnabled);
    } catch (e) {
      console.error('[CameraTools] Failed to toggle camera:', e);
    }
  }

  // Toggle handedness (for testing/demos - could be in settings later)
  function toggleHandedness() {
    const newHandedness = handedness === 'right' ? 'left' : 'right';
    handedness = newHandedness;
    setHandedness(newHandedness);
  }

  // Sync with external state changes
  $effect(() => {
    const enabled = getCameraEnabled();
    if (enabled !== cameraEnabled) {
      cameraEnabled = enabled;
    }
  });
</script>

<!--
  CameraTools
  
  Floating camera controls that appear just above the ForegroundLayer.
  Line-drawn aesthetic with transparent innards and no button borders.
  Accommodates left-handed users via handedness preference.
  #if isAndroid()
-->
  <!-- CameraTools rendered: handedness={handedness}, hidden={hidden} -->
  <div 
    class="camera-tools"
    class:left-handed={handedness === 'left'}
    class:right-handed={handedness === 'right'}
    class:visible={isVisible}
    class:hidden={hidden}
    style="bottom: calc({foregroundPositionVh}vh + 8px)"
  >
    <!-- Camera Toggle Button -->
    <button 
      class="tool-button camera-toggle"
      class:enabled={cameraEnabled}
      onclick={toggleCamera}
      aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
      title={cameraEnabled ? 'Camera on' : 'Camera off'}
    >
      <svg 
        class="tool-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if cameraEnabled}
          <!-- Camera with lens visible -->
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path d="M8 6L9 4h6l1 2" />
          <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
        {:else}
          <!-- Camera with slash -->
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M8 6L9 4h6l1 2" />
        {/if}
      </svg>
    </button>

    <!-- Handedness Toggle (subtle, for accessibility) -->
    <button 
      class="tool-button handedness-toggle"
      onclick={toggleHandedness}
      aria-label="Switch handedness"
      title="{handedness === 'right' ? 'Right' : 'Left'}-handed mode"
    >
      <svg 
        class="tool-icon handedness-icon" 
        class:left={handedness === 'left'}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Hand icon -->
        <path d="M8 11V7a2 2 0 0 1 4 0v4" />
        <path d="M12 11V9a2 2 0 0 1 4 0v2" />
        <path d="M16 11V8a2 2 0 0 1 4 0v3" />
        <path d="M20 11v5a4 4 0 0 1-4 4h-4" />
        <path d="M4 11v4a4 4 0 0 0 4 4h4" />
      </svg>
    </button>
  </div>

<style>
  .camera-tools {
    position: absolute;
    top: -42px;
    z-index: 5;
    display: flex;
    gap: 12px;
    padding: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; /* Let clicks pass through except on buttons */
  }

  /* Handedness positioning and ordering */
  .camera-tools.right-handed {
    right: 16px;
    left: auto;
    flex-direction: row; /* Camera first, then handedness toggle */
  }

  .camera-tools.left-handed {
    left: 16px;
    right: auto;
    flex-direction: row-reverse; /* Handedness toggle first, then camera */
  }

  /* Tool Button - Line drawn aesthetic */
  .tool-button {
    width: 44px;
    height: 44px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    pointer-events: auto;
    transition: transform 0.2s ease, opacity 0.2s ease;
    padding: 0;
  }

  .tool-button:hover {
    transform: scale(1.1);
  }

  .tool-button:active {
    transform: scale(0.95);
  }

  /* Line-drawn icon style */
  .tool-icon {
    width: 28px;
    height: 28px;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  /* Camera enabled state */
  .camera-toggle.enabled .tool-icon {
    color: #64c864;
    filter: drop-shadow(0 0 8px rgba(100, 200, 100, 0.4));
  }

  .camera-toggle:not(.enabled) .tool-icon {
    color: rgba(255, 100, 100, 0.8);
  }

  /* Handedness icon */
  .handedness-icon {
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }

  .handedness-icon.left {
    transform: scaleX(-1);
  }

  .tool-button:hover .handedness-icon {
    opacity: 0.8;
  }

  /* Subtle line background on hover */
  .tool-button::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    opacity: 0;
    transition: opacity 0.2s ease;
    color: rgba(255, 255, 255, 0.3);
  }

  .tool-button:hover::before {
    opacity: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .camera-tools {
      bottom: calc(15vh + 4px);
    }

    .camera-tools.right-handed {
      right: 8px;
    }

    .camera-tools.left-handed {
      left: 8px;
    }

    .tool-button {
      width: 40px;
      height: 40px;
    }

    .tool-icon {
      width: 24px;
      height: 24px;
    }

    .handedness-icon {
      width: 18px;
      height: 18px;
    }
  }

  /* When hidden explicitly */
  .camera-tools.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px);
  }
</style>
