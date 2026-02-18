<script lang="ts">
  import CaptureLayer from '$lib/components/capture/CaptureLayer.svelte';
  import ForegroundLayer from '$lib/components/feed/ForegroundLayer.svelte';
  import PairingQrModal from '$lib/components/pairing/PairingQrModal.svelte';
  import CameraTools from '$lib/components/capture/CameraTools.svelte';
  import { parsePairingUrl } from '$lib/stores/devices.svelte';
  import type { CameraMode } from '@o19/foundframe-tauri';
  import { getCameraEnabled } from '$lib/stores/sessionState.svelte';

  // Camera state
  let cameraMode = $state<CameraMode>('preview');
  let cameraEnabled = $state(getCameraEnabled());
  let foregroundLayer = $state<ForegroundLayer | null>(null);
  let foregroundPosition = $state(15); // Default peek position

  // Pairing modal state
  let isPairingModalOpen = $state(false);
  let isPairing = $state(false);

  /**
   * Handle QR scan mode changes from ForegroundLayer
   * When foreground is pulled down > 50%, enable QR scanning
   */
  function handleQrScanModeChange(enabled: boolean) {
    cameraMode = enabled ? 'qr' : 'preview';
    console.log('[HomePage] Camera mode changed to:', cameraMode);
  }

  /**
   * Handle foreground position changes
   * Used for positioning QR popup above the foreground
   */
  function handleForegroundPositionChange(positionVh: number) {
    foregroundPosition = positionVh;
  }

  /**
   * Handle pair button click (desktop only)
   * Opens the pairing QR modal
   */
  function handlePairClick() {
    isPairingModalOpen = true;
    isPairing = true;
  }

  /**
   * Handle pairing modal close
   */
  function handlePairingModalClose() {
    isPairingModalOpen = false;
    isPairing = false;
  }

  /**
   * Handle QR code detection
   * This is used for device pairing flow
   */
  async function handleQrScanned(content: string) {
    console.log('[HomePage] QR code scanned:', content);

    // Check if it's a pairing URL (starts with o19://)
    if (content.startsWith('o19://')) {
      try {
        const pairingData = await parsePairingUrl(content);
        console.log('[HomePage] Pairing data:', pairingData);

        // The QRDetails popup will show with options to follow/copy
        // User can close it and continue scanning, or snap foreground back up
        console.log('[HomePage] Pairing device:', pairingData.deviceName);
      } catch (e) {
        console.error('[HomePage] Failed to parse pairing URL:', e);
      }
    } else {
      // Handle other QR codes (URLs, text, etc.)
      console.log('[HomePage] Generic QR content:', content);
    }
  }

  /**
   * Handle photo capture
   * Photo is saved to gallery natively, we just get the URI
   */
  function handlePhotoCaptured(uri: string) {
    console.log('[HomePage] Photo captured:', uri);
    // TODO: Add to stream or show confirmation
  }

  /**
   * Handle camera toggle from CameraTools
   */
  function handleCameraToggle(enabled: boolean) {
    cameraEnabled = enabled;
    console.log('[HomePage] Camera toggled:', enabled);
  }
</script>

<div class="home-page">
  <!-- Background: Camera Capture Interface -->
  <CaptureLayer
    mode={cameraMode}
    active={cameraEnabled}
    foregroundPositionVh={foregroundPosition}
    onQrScanned={handleQrScanned}
    onPhotoCaptured={handlePhotoCaptured}
  />

  <!-- Foreground: Creation Tools + Feed -->
  <ForegroundLayer
    bind:this={foregroundLayer}
    onQrScanModeChange={handleQrScanModeChange}
    onPositionChange={handleForegroundPositionChange}
    onPairClick={handlePairClick}
    {isPairing}
  >
    <!-- Camera Tools - Floating line-drawn controls -->
    <CameraTools
      mode={cameraMode}
      foregroundPositionVh={foregroundPosition}
      onCameraToggle={handleCameraToggle}
    />
  </ForegroundLayer>


  <!-- Pairing QR Modal (desktop only) -->
  <PairingQrModal
    isOpen={isPairingModalOpen}
    deviceName="DearDiary Desktop"
    onClose={handlePairingModalClose}
  />
</div>

<style>
  :global(*), :global(*::before), :global(*::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .home-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
</style>
