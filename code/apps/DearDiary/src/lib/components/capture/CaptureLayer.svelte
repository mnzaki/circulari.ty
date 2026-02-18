<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import {
    startCamera,
    stopCamera,
    setCameraMode,
    requestCameraPermissions,
    checkCameraPermissions,
    QR_SCANNED_EVENT,
    PHOTO_CAPTURED_EVENT,
    type CameraMode
  } from '@o19/foundframe-tauri';
  import { isAndroid } from '$lib/stores/app.svelte';
  import QRDetails from './QRDetails.svelte';

  // Props
  interface Props {
    /** Current camera mode - controlled by parent */
    mode?: CameraMode;
    /** Whether camera should be active */
    active?: boolean;
    /** Callback when QR code is scanned */
    onQrScanned?: (content: string) => void;
    /** Callback when photo is captured */
    onPhotoCaptured?: (uri: string) => void;
    /** Current foreground position in vh (for QR popup positioning) */
    foregroundPositionVh?: number;
  }

  let {
    mode = 'preview',
    active = true,
    onQrScanned,
    onPhotoCaptured,
    foregroundPositionVh = 15
  }: Props = $props();

  // State
  let isInitialized = $state(false);
  let hasPermission = $state(false);
  let error = $state<string | null>(null);
  let unlistenQr: UnlistenFn | null = null;
  let unlistenPhoto: UnlistenFn | null = null;

  // QR Details popup state
  let scannedQrContent = $state<string | null>(null);
  let isScanningPaused = $state(false);

  // Calculate bottom offset for QR popup based on foreground position
  // When foreground is at 15vh (peek), popup fills remaining space
  // When foreground is pulled down, popup shrinks to fit above it
  const qrPopupBottomOffset = $derived(Math.max(15, foregroundPositionVh));

  // Initialize camera on mount
  onMount(async () => {
    // Only run on Android (Tauri mobile)
    if (!isAndroid()) {
      console.log('[CaptureLayer] Camera only available on Android');
      return;
    }

    try {
      // Check current permission status
      console.log('[CaptureLayer] Checking camera permissions...');
      const checkResult = await checkCameraPermissions();
      console.log('[CaptureLayer] Permission check result:', checkResult);
      hasPermission = checkResult.camera === 'granted';
      
      // If not granted, request permissions (this will show Android permission dialog)
      if (!hasPermission) {
        console.log('[CaptureLayer] Requesting camera permissions...');
        const permResult = await requestCameraPermissions();
        console.log('[CaptureLayer] Permission request result:', permResult);
        hasPermission = permResult.granted ?? false;
      }

      if (!hasPermission) {
        console.error('[CaptureLayer] Camera permission denied');
        error = 'Camera permission denied. Please enable camera access in app settings.';
        return;
      }
      console.log('[CaptureLayer] Camera permission granted');

      // Set up event listeners
      unlistenQr = await listen(QR_SCANNED_EVENT, (event: { payload: { content: string } }) => {
        console.log('[CaptureLayer] QR scanned:', event.payload.content);
        // Pause scanning and show popup
        scannedQrContent = event.payload.content;
        isScanningPaused = true;
        // Also call the parent's callback
        onQrScanned?.(event.payload.content);
      });

      unlistenPhoto = await listen(PHOTO_CAPTURED_EVENT, (event: { payload: { uri: string } }) => {
        console.log('[CaptureLayer] Photo captured:', event.payload.uri);
        onPhotoCaptured?.(event.payload.uri);
      });

      // Start camera if active
      if (active) {
        await startCameraWithMode(mode);
      }

      isInitialized = true;
    } catch (e) {
      console.error('[CaptureLayer] Failed to initialize camera:', e);
      error = e instanceof Error ? e.message : 'Camera initialization failed';
    }
  });

  // Cleanup on destroy
  onDestroy(() => {
    unlistenQr?.();
    unlistenPhoto?.();

    if (isAndroid() && isInitialized) {
      stopCamera().catch(e => {
        console.error('[CaptureLayer] Error stopping camera:', e);
      });
    }
  });

  // React to mode changes (but not when scanning is paused)
  $effect(() => {
    if (isInitialized && active && isAndroid() && !isScanningPaused) {
      setCameraMode({ mode }).catch(e => {
        console.error('[CaptureLayer] Error setting camera mode:', e);
      });
    }
  });

  // React to active changes
  $effect(() => {
    if (!isInitialized || !isAndroid()) return;

    if (active) {
      startCameraWithMode(mode);
    } else {
      stopCamera().catch(e => {
        console.error('[CaptureLayer] Error stopping camera:', e);
      });
    }
  });

  // When scanning is paused (popup shown), switch to preview mode
  $effect(() => {
    if (!isInitialized || !isAndroid()) return;
    
    if (isScanningPaused) {
      // Pause scanning by switching to preview mode
      setCameraMode({ mode: 'preview' }).catch(e => {
        console.error('[CaptureLayer] Error pausing scan:', e);
      });
    } else if (mode === 'qr') {
      // Resume scanning if popup closed and we should be in QR mode
      setCameraMode({ mode: 'qr' }).catch(e => {
        console.error('[CaptureLayer] Error resuming scan:', e);
      });
    }
  });

  async function startCameraWithMode(cameraMode: CameraMode) {
    try {
      await startCamera({
        mode: cameraMode,
        cameraDirection: 'back' // Default to back camera
      });
      console.log('[CaptureLayer] Camera started in mode:', cameraMode);
    } catch (e) {
      console.error('[CaptureLayer] Error starting camera:', e);
      error = e instanceof Error ? e.message : 'Failed to start camera';
    }
  }

  function handleCloseQrPopup() {
    scannedQrContent = null;
    isScanningPaused = false;
  }

  async function handleCopyQrContent(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      // Optional: show toast or feedback
      console.log('[CaptureLayer] Copied to clipboard:', content);
    } catch (e) {
      console.error('[CaptureLayer] Failed to copy:', e);
    }
  }

  function handleFollowUrl(url: string) {
    // Open URL in browser
    window.open(url, '_blank');
  }
</script>

<!--
  CaptureLayer

  This component manages the native camera preview that lives behind the WebView.
  On Android, it uses the CameraPlugin to show a native camera preview.
  On desktop/web, it shows a placeholder gradient.
-->
<div class="capture-layer" class:active class:native-camera={isAndroid() && hasPermission} data-mode={mode}>
  {#if error}
    <div class="camera-error">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{error}</span>
    </div>
  {:else if !isAndroid()}
    <!-- Desktop/Web placeholder -->
    <div class="camera-placeholder">
      <span class="placeholder-text">Camera Preview</span>
      <span class="placeholder-subtext">(Native camera on Android)</span>
    </div>
  {:else if !hasPermission}
    <div class="camera-placeholder">
      <span class="placeholder-text">Camera Permission Required</span>
    </div>
  {:else}
    <!--
      On Android, the actual camera preview is rendered natively behind the WebView.
      This div is transparent to let the native preview show through.
    -->
    <div class="native-camera-container"></div>

    <!-- Camera mode indicator (hidden when QR popup is showing) -->
    {#if !isScanningPaused}
      <div class="mode-indicator">
        {#if mode === 'qr'}
          <span class="mode-badge scanning">QR Scan</span>
        {:else if mode === 'photo'}
          <span class="mode-badge capture">Photo</span>
        {:else}
          <span class="mode-badge preview">Preview</span>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<!-- QR Details Popup - shown above ForegroundLayer -->
{#if scannedQrContent && isAndroid()}
  <QRDetails
    content={scannedQrContent}
    bottomOffsetVh={qrPopupBottomOffset}
    onClose={handleCloseQrPopup}
    onCopy={handleCopyQrContent}
    onFollowUrl={handleFollowUrl}
  />
{/if}

<style>
  .capture-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    overflow: hidden;
  }

  /* When showing native camera on Android, make transparent so it shows through */
  .capture-layer.native-camera {
    background: transparent !important;
  }
  
  .capture-layer.native-camera .native-camera-container {
    background: transparent !important;
    pointer-events: none; /* Let touch events pass through to camera if needed */
  }

  .camera-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .placeholder-text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.5rem;
    font-weight: 300;
  }

  .placeholder-subtext {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.875rem;
  }

  .camera-error {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    text-align: center;
  }

  .error-icon {
    font-size: 2rem;
  }

  .error-text {
    color: rgba(255, 100, 100, 0.9);
    font-size: 1rem;
  }

  .native-camera-container {
    /* The native camera preview is rendered behind the WebView.
       This container is transparent to let it show through.
       The actual preview is managed by the CameraPlugin. */
    width: 100%;
    height: 100%;
    background: transparent;
  }

  .mode-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 1;
  }

  .mode-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    backdrop-filter: blur(8px);
  }

  .mode-badge.preview {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
  }

  .mode-badge.scanning {
    background: rgba(100, 200, 100, 0.3);
    color: rgba(100, 255, 100, 0.9);
    animation: pulse 2s ease-in-out infinite;
  }

  .mode-badge.capture {
    background: rgba(200, 100, 100, 0.3);
    color: rgba(255, 100, 100, 0.9);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
</style>
