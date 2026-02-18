<script lang="ts">
  import { onMount } from 'svelte';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { 
    getServiceFatalError, 
    getServiceConnected,
    clearServiceError,
    checkServiceStatus,
    startService
  } from '$lib/stores/serviceStatus.svelte';

  // State - reactive to store
  let fatalError = $state(getServiceFatalError());
  let isConnected = $state(getServiceConnected());
  let hasChecked = $state(false);

  // Poll for status on mount (in case event fired before we were ready)
  onMount(() => {
    console.log('[ServiceErrorOverlay] Mounted, checking service status...');
    
    // Check immediately
    checkServiceStatus().then(() => {
      hasChecked = true;
      console.log('[ServiceErrorOverlay] Initial check complete');
    });
    
    // Also poll a few times in case service is still starting
    const pollInterval = setInterval(() => {
      if (!getServiceConnected() && !fatalError) {
        console.log('[ServiceErrorOverlay] Polling for status...');
        checkServiceStatus();
      } else {
        clearInterval(pollInterval);
      }
    }, 1000);
    
    // Stop polling after 10 seconds
    setTimeout(() => clearInterval(pollInterval), 10000);
    
    return () => clearInterval(pollInterval);
  });

  // Update when store changes
  $effect(() => {
    const err = getServiceFatalError();
    const connected = getServiceConnected();
    
    if (connected) {
      // If service connects, clear the error
      fatalError = null;
    } else if (err) {
      console.error('[ServiceErrorOverlay] Fatal error from store:', err);
      fatalError = err;
    }
  });

  async function handleRestart() {
    clearServiceError();
    // Try to close the app window
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (e) {
      console.error('[ServiceErrorOverlay] Failed to close window:', e);
      // Force reload as fallback
      window.location.reload();
    }
  }

  async function handleReload() {
    clearServiceError();
    
    // Try to start the service before reloading
    console.log('[ServiceErrorOverlay] Attempting to start service before reload...');
    const result = await startService();
    
    if (result.success) {
      console.log('[ServiceErrorOverlay] Service started, checking status...');
      await checkServiceStatus();
    } else {
      console.log('[ServiceErrorOverlay] Service start failed, reloading page...');
      window.location.reload();
    }
  }
</script>

<!--
  ServiceErrorOverlay
  
  A full-screen fatal error overlay that appears when the FoundframeRadicle
  background service fails to connect or crashes. This is a "deadly" condition
  that requires app restart.
-->
{#if fatalError}
  <div class="fatal-error-overlay" role="alertdialog" aria-modal="true" aria-labelledby="fatal-error-title">
    <div class="error-card">
      <!-- Icon -->
      <div class="error-icon-container">
        <span class="error-icon">🔌</span>
        <div class="error-pulse"></div>
      </div>

      <!-- Title -->
      <h1 id="fatal-error-title" class="error-title">Service Unavailable</h1>

      <!-- Message -->
      <p class="error-message">{fatalError.message}</p>

      <!-- Details (collapsible) -->
      <details class="error-details">
        <summary>Technical Details</summary>
        <div class="details-content">
          <p><strong>Error:</strong> {fatalError.error}</p>
          <p><strong>Details:</strong> {fatalError.details}</p>
        </div>
      </details>

      <!-- Actions -->
      <div class="error-actions">
        <button class="action-button primary" onclick={handleRestart}>
          <span class="button-icon">🔄</span>
          Restart App
        </button>
        <button class="action-button secondary" onclick={handleReload}>
          <span class="button-icon">↻</span>
          Reload
        </button>
      </div>

      <!-- Help text -->
      <p class="help-text">
        If this keeps happening, check that the :foundframe process is running in Android settings.
      </p>
    </div>
  </div>
{/if}

<style>
  .fatal-error-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 26, 46, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 10000;
    animation: fade-in 0.3s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .error-card {
    background: white;
    border-radius: 24px;
    padding: 40px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .error-icon-container {
    position: relative;
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .error-icon {
    font-size: 3rem;
    z-index: 1;
    animation: icon-shake 0.5s ease-in-out;
  }

  @keyframes icon-shake {
    0%, 100% { transform: rotate(0); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  .error-pulse {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(220, 53, 69, 0.1);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  .error-title {
    margin: 0 0 16px;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1a2e;
  }

  .error-message {
    margin: 0 0 24px;
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
  }

  .error-details {
    margin: 0 0 24px;
    text-align: left;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 12px;
    overflow: hidden;
  }

  .error-details summary {
    padding: 12px 16px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
    user-select: none;
  }

  .error-details summary:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .details-content {
    padding: 0 16px 16px;
    font-size: 0.8125rem;
    color: #888;
  }

  .details-content p {
    margin: 8px 0;
    word-break: break-all;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .action-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #555;
  }

  .action-button.secondary:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .button-icon {
    font-size: 1.125rem;
  }

  .help-text {
    margin: 0;
    font-size: 0.8125rem;
    color: #888;
    line-height: 1.5;
  }
</style>
