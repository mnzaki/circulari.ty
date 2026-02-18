<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { generatePairingQr, getIsLoading, getError, clearError } from '$lib/stores/devices.svelte';
  import type { PairingQrData } from '@o19/foundframe-front';

  interface Props {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Device name to display in the QR */
    deviceName?: string;
    /** Called when the modal is closed */
    onClose: () => void;
  }

  let { isOpen, deviceName = 'My Device', onClose }: Props = $props();

  // State
  let pairingData = $state<PairingQrData | null>(null);
  let qrCanvas = $state<HTMLCanvasElement | null>(null);
  let hasAttemptedGeneration = $state(false); // Prevent infinite loops

  // Derived state from store
  let isLoading = $derived(getIsLoading());
  let error = $derived(getError());

  // Reset state when modal opens
  $effect(() => {
    if (isOpen) {
      // Reset for fresh generation when modal reopens
      if (!pairingData && !isLoading) {
        hasAttemptedGeneration = false;
      }
    }
  });

  // Generate QR code when modal opens
  $effect(() => {
    if (isOpen && !pairingData && !isLoading && !hasAttemptedGeneration) {
      hasAttemptedGeneration = true;
      generateQrCode();
    }
  });

  // Draw QR code on canvas when data changes
  $effect(() => {
    const url = pairingData?.url;
    if (url && qrCanvas) {
      drawQrCode(url);
    }
  });

  async function generateQrCode() {
    clearError();
    
    try {
      console.log('[PairingQrModal] Generating QR for device:', deviceName);
      const response = await generatePairingQr(deviceName);
      console.log('[PairingQrModal] Got response:', response);
      
      pairingData = response;
      console.log('[PairingQrModal] pairingData set to:', pairingData);
    } catch (e) {
      console.error('[PairingQrModal] Failed to generate QR:', e);
      // Error is already set in the store
    }
  }

  function drawQrCode(url: string) {
    if (!qrCanvas) return;
    
    const canvas = qrCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate a simple QR-like pattern (in production, use a QR library)
    // For now, we'll create a visual representation
    const size = 200;
    const padding = 20;
    const cellSize = (size - padding * 2) / 25; // 25x25 grid
    
    // Center the QR code
    const offsetX = (canvas.width - size) / 2;
    const offsetY = (canvas.height - size) / 2;

    // Draw finder patterns (the three large squares)
    const finderPositions = [
      { x: 0, y: 0 },
      { x: 18, y: 0 },
      { x: 0, y: 18 }
    ];

    ctx.fillStyle = '#1a1a2e';

    finderPositions.forEach(pos => {
      const fx = offsetX + padding + pos.x * cellSize;
      const fy = offsetY + padding + pos.y * cellSize;
      
      // Outer square (7x7)
      ctx.fillRect(fx, fy, cellSize * 7, cellSize * 7);
      
      // Inner white square (5x5)
      ctx.fillStyle = 'white';
      ctx.fillRect(fx + cellSize, fy + cellSize, cellSize * 5, cellSize * 5);
      
      // Center black square (3x3)
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(fx + cellSize * 2, fy + cellSize * 2, cellSize * 3, cellSize * 3);
    });

    // Draw data modules (pseudo-random based on URL hash)
    ctx.fillStyle = '#1a1a2e';
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Skip finder pattern areas
        if ((row < 7 && col < 7) || 
            (row < 7 && col >= 18) || 
            (row >= 18 && col < 7)) {
          continue;
        }

        // Generate pseudo-random pattern from URL
        const charIndex = (row * 25 + col) % url.length;
        const charCode = url.charCodeAt(charIndex);
        if (charCode % 2 === 0) {
          const x = offsetX + padding + col * cellSize;
          const y = offsetY + padding + row * cellSize;
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Draw URL text below QR
    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(url.substring(0, 40) + (url.length > 40 ? '...' : ''), canvas.width / 2, offsetY + size + 20);
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleCopyUrl() {
    const url = pairingData?.url;
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }

  function handleRegenerate() {
    pairingData = null;
    hasAttemptedGeneration = false; // Reset to allow regeneration
    clearError();
    generateQrCode();
  }
</script>

<!--
  PairingQrModal
  
  A modal dialog that displays a QR code for device pairing.
  The QR code contains a URL that other devices can scan to pair.
-->
{#if isOpen}
  <div 
    class="pairing-modal-backdrop"
    onclick={handleBackdropClick}
    transition:fade={{ duration: 200 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="pairing-title"
  >
    <div 
      class="pairing-modal"
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.8 }}
    >
      <!-- Header -->
      <div class="modal-header">
        <h2 id="pairing-title" class="modal-title">
          <span class="title-icon">🔗</span>
          Pair with Another Device
        </h2>
        <button 
          class="close-button"
          onclick={onClose}
          aria-label="Close"
        >
          <span class="close-icon">×</span>
        </button>
      </div>

      <!-- Content -->
      <div class="modal-content">
        {#if isLoading}
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Generating pairing code...</p>
          </div>
        {:else if error}
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{error}</p>
            <button class="retry-button" onclick={handleRegenerate}>
              Try Again
            </button>
          </div>
        {:else if pairingData && pairingData.url}
          <div class="qr-display">
            <!-- QR Code Canvas -->
            <div class="qr-container">
              <canvas 
                bind:this={qrCanvas}
                width="280" 
                height="280"
                class="qr-canvas"
              ></canvas>
            </div>

            <!-- Emoji identity - below QR, not overlaying it -->
            <div class="identity-display" title="Your device identity">
              <span class="identity-emoji">{pairingData?.emojiIdentity ?? '🔑'}</span>
            </div>

            <!-- Instructions -->
            <div class="instructions">
              <p class="instruction-text">
                Scan this QR code with another device to pair with 
                <strong>{deviceName}</strong>
              </p>
              
              <!-- Device info -->
              <div class="device-info">
                <span class="info-label">Device ID:</span>
                <code class="info-value">{pairingData?.nodeIdHex?.substring(0, 16) ?? '...'}...</code>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button class="action-button secondary" onclick={handleCopyUrl}>
                <span class="button-icon">📋</span>
                Copy URL
              </button>
              <button class="action-button primary" onclick={handleRegenerate}>
                <span class="button-icon">🔄</span>
                New Code
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer hint -->
      <div class="modal-footer">
        <p class="footer-hint">
          💡 The other device needs to scan this code while it's displayed
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .pairing-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 1000;
  }

  .pairing-modal {
    background: white;
    border-radius: 20px;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    width: 100%;
    max-width: 400px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title-icon {
    font-size: 1.5rem;
  }

  .close-button {
    width: 36px;
    height: 36px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
  }

  .close-icon {
    font-size: 1.5rem;
    color: #666;
    line-height: 1;
  }

  .modal-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 16px;
    text-align: center;
  }

  .error-icon {
    font-size: 3rem;
  }

  .retry-button {
    padding: 10px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  /* QR Display */
  .qr-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .qr-container {
    position: relative;
    padding: 16px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .qr-canvas {
    display: block;
    width: 240px;
    height: 240px;
  }

  .identity-display {
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 260px;
  }

  .identity-emoji {
    font-size: 1.5rem;
    line-height: 1.4;
    text-align: center;
    word-break: break-all;
    overflow-wrap: anywhere;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  /* Instructions */
  .instructions {
    text-align: center;
    max-width: 100%;
    padding: 0 8px;
  }

  .instruction-text {
    margin: 0 0 12px;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #444;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .device-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.8125rem;
    color: #666;
    flex-wrap: wrap;
    max-width: 100%;
  }

  .info-label {
    font-weight: 500;
    flex-shrink: 0;
  }

  .info-value {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: ui-monospace, monospace;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Actions */
  .modal-actions {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #444;
  }

  .action-button.secondary:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .button-icon {
    font-size: 1rem;
  }

  /* Footer */
  .modal-footer {
    padding: 12px 24px;
    background: rgba(102, 126, 234, 0.05);
    border-top: 1px solid rgba(102, 126, 234, 0.1);
  }

  .footer-hint {
    margin: 0;
    font-size: 0.8125rem;
    color: #667eea;
    text-align: center;
  }

  /* Responsive - hide modal on small screens (button shouldn't be visible anyway) */
  @media (max-width: 768px) {
    .pairing-modal-backdrop {
      display: none;
    }
  }
</style>
