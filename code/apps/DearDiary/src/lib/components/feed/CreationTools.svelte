<script lang="ts">
  import CaptureButton from './CaptureButton.svelte';
  import InputArea, { type InputType } from '$lib/components/inputs/InputArea.svelte';

  interface Props {
    activeInput: InputType;
    onActivateInput: (type: InputType) => void;
  }

  let { activeInput, onActivateInput }: Props = $props();

  // Left side CTAs (tabs)
  const leftCTAs: Array<{ id: InputType; label: string; icon: string }> = [
    { id: 'link', label: 'Link', icon: '🔗' },
    { id: 'text', label: 'Text', icon: '📝' }
  ];

  // Right side CTAs (tabs)
  const rightCTAs: Array<{ id: InputType; label: string; icon: string; disabled?: boolean }> = [
    { id: 'person', label: 'Person', icon: '👤' },
    { id: null, label: 'Media', icon: '📷', disabled: true }
  ];

  function handleCTAClick(type: InputType) {
    if (type === null) return;
    
    // Toggle: if already active, close it
    if (activeInput === type) {
      onActivateInput(null);
    } else {
      onActivateInput(type);
    }
  }
</script>

<div class="creation-tools-inner">
  <!-- Tab Bar: CTAs on left, CCCB breaking out in center, CTAs on right -->
  <div class="tab-bar-container">
    <!-- Left CTAs -->
    <div class="cta-group cta-group--left">
      {#each leftCTAs as cta}
        <button 
          class="tab"
          class:active={activeInput === cta.id}
          onclick={() => handleCTAClick(cta.id)}
          aria-selected={activeInput === cta.id}
          role="tab"
        >
          <span class="tab-icon">{cta.icon}</span>
          <span class="tab-label">{cta.label}</span>
        </button>
      {/each}
    </div>

    <!-- CCCB - Breaking out of the grid, oversized -->
    <div class="cccb-breakout">
      <CaptureButton />
      <!-- Visual connector line from CCCB down to input area -->
      {#if activeInput}
        <div class="connector-line"></div>
      {/if}
    </div>

    <!-- Right CTAs -->
    <div class="cta-group cta-group--right">
      {#each rightCTAs as cta}
        <button 
          class="tab"
          class:active={activeInput === cta.id}
          class:disabled={cta.disabled}
          onclick={() => !cta.disabled && handleCTAClick(cta.id)}
          aria-selected={activeInput === cta.id}
          role="tab"
          disabled={cta.disabled}
        >
          <span class="tab-icon">{cta.icon}</span>
          <span class="tab-label">{cta.label}</span>
          {#if cta.disabled}
            <span class="soon-badge">Soon</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Input Area - The tab body, connected to active tab -->
  <div class="tab-body" class:visible={activeInput}>
    {#if activeInput}
      <!-- Active tab indicator - shows which tab is selected -->
      <div class="active-indicator">
        <div class="indicator-line"></div>
      </div>
    {/if}
    
    <InputArea 
      {activeInput}
      onClose={() => onActivateInput(null)}
    />
  </div>
</div>

<style>
  .creation-tools-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  /* Tab Bar Container - Flexbox with centered CCCB */
  .tab-bar-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    max-width: 480px;
    padding: 8px 0;
  }

  /* CTA Groups - Fixed equal widths */
  .cta-group {
    display: flex;
    gap: 6px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    padding: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    width: 130px;
    flex-shrink: 0;
  }

  .cta-group--left {
    justify-content: flex-end;
    border-radius: 16px 8px 8px 16px;
    margin-right: -10px;
  }

  .cta-group--right {
    justify-content: flex-start;
    border-radius: 8px 16px 16px 8px;
    margin-left: -10px;
  }

  /* Tab Styling */
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 14px;
    background: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    min-width: 52px;
  }

  .tab:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
  }

  .tab.active {
    background: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: #667eea;
    border-radius: 50%;
  }

  .tab:disabled,
  .tab.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tab-icon {
    font-size: 1.3rem;
    line-height: 1;
  }

  .tab-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #444;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .soon-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background: #667eea;
    color: white;
    font-size: 0.5rem;
    padding: 1px 4px;
    border-radius: 6px;
    font-weight: 700;
  }

  /* CCCB Breakout - Oversized circle outside the grid */
  .cccb-breakout {
    position: relative;
    z-index: 2;
    margin: -20px 4px -30px;
    padding: 8px;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,248,248,0.9) 100%);
    border-radius: 50%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .connector-line {
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 16px;
    background: linear-gradient(180deg, #667eea 0%, transparent 100%);
    animation: grow-line 0.2s ease-out;
  }

  @keyframes grow-line {
    from { transform: translateX(-50%) scaleY(0); }
    to { transform: translateX(-50%) scaleY(1); }
  }

  /* Tab Body - Contains the input area */
  .tab-body {
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.3s ease, opacity 0.2s ease, margin 0.3s ease;
    position: relative;
  }

  .tab-body.visible {
    max-height: 280px;
    opacity: 1;
    margin-top: 8px;
  }

  /* Active indicator - connects tab to body */
  .active-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    display: flex;
    justify-content: center;
  }

  .indicator-line {
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, #667eea 20%, #764ba2 80%, transparent 100%);
    border-radius: 1px;
    animation: fade-in 0.3s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; transform: scaleX(0.5); }
    to { opacity: 1; transform: scaleX(1); }
  }
</style>
