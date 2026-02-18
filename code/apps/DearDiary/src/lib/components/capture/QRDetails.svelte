<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // Props
  interface Props {
    content: string;
    /** Distance from bottom of screen (in vh) - adjusts based on foreground position */
    bottomOffsetVh?: number;
    /** Called when user wants to follow URL */
    onFollowUrl?: (url: string) => void;
    /** Called when user wants to copy content */
    onCopy?: (content: string) => void;
    /** Called when user closes the popup */
    onClose?: () => void;
  }

  let {
    content,
    bottomOffsetVh = 15,
    onFollowUrl,
    onCopy,
    onClose
  }: Props = $props();

  // Check if content is a URL
  const isUrl = $derived(() => {
    try {
      new URL(content);
      return true;
    } catch {
      return false;
    }
  });

  // Truncate long content for display
  const displayContent = $derived(() => {
    if (content.length > 200) {
      return content.slice(0, 200) + '...';
    }
    return content;
  });

  function handleFollow() {
    if (isUrl()) {
      onFollowUrl?.(content);
    }
  }

  function handleCopy() {
    onCopy?.(content);
  }

  function handleClose() {
    onClose?.();
  }

  // Prevent clicks from passing through to layers below
  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }
</script>

<!--
  QRDetails Popup
  
  Shows QR code contents in a centered, non-modal popup.
  Positioned above the ForegroundLayer and adjusts when foreground moves.
  Scanning pauses while this is visible.
-->
<div 
  class="qr-details-backdrop"
  style="--bottom-offset: {bottomOffsetVh}vh"
  onclick={handleBackdropClick}
  role="dialog"
  tabindex="-1"
  aria-modal="false"
  aria-label="QR Code Details"
>
  <div 
    class="qr-details-popup"
    transition:scale={{ duration: 200, easing: cubicOut, start: 0.9 }}
  >
    <!-- Header with X button -->
    <div class="qr-details-header">
      <h3 class="qr-details-title">QR Code Detected</h3>
      <button 
        class="close-button"
        onclick={handleClose}
        aria-label="Close"
      >
        <span class="close-icon">×</span>
      </button>
    </div>

    <!-- Content -->
    <div class="qr-details-content">
      <p class="qr-content-text" title={content}>
        {displayContent()}
      </p>
    </div>

    <!-- Actions -->
    <div class="qr-details-actions">
      {#if isUrl()}
        <button 
          class="action-button primary"
          onclick={handleFollow}
        >
          <span class="button-icon">🔗</span>
          <span class="button-text">Open Link</span>
        </button>
      {/if}
      
      <button 
        class="action-button secondary"
        onclick={handleCopy}
      >
        <span class="button-icon">📋</span>
        <span class="button-text">Copy</span>
      </button>
    </div>
  </div>
</div>

<style>
  .qr-details-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: var(--bottom-offset, 15vh);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
    pointer-events: auto;
    transition: bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .qr-details-popup {
    background: white;
    border-radius: 16px;
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 360px;
    max-height: calc(100% - 2rem);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .qr-details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1rem 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .qr-details-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a2e;
  }

  .close-button {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, transform 0.15s;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-icon {
    font-size: 1.25rem;
    line-height: 1;
    color: #666;
  }

  .qr-details-content {
    padding: 1rem;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .qr-content-text {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #333;
    word-break: break-all;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .qr-details-actions {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .action-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  }

  .action-button:hover {
    transform: translateY(-1px);
  }

  .action-button:active {
    transform: translateY(0);
  }

  .action-button.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  }

  .action-button.primary:hover {
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .action-button.secondary:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .button-icon {
    font-size: 1rem;
  }

  .button-text {
    white-space: nowrap;
  }
</style>
