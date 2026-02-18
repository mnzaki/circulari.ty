<script lang="ts">
  interface Props {
    /** Called when the pair button is clicked */
    onClick?: () => void;
    /** Whether currently pairing/in-progress */
    isPairing?: boolean;
  }

  let { onClick, isPairing = false }: Props = $props();
</script>

<!--
  PairButton
  
  A device pairing button that appears on desktop/large screens.
  Shows a creative "device connecting" animation when active.
  Positioned to the left of the CreationTools.
-->
<button 
  class="pair-button"
  class:pairing={isPairing}
  onclick={onClick}
  aria-label="Pair device"
  title="Pair with another device"
>
  <div class="icon-container">
    <span class="device-icon device-left">📱</span>
    <span class="connection-waves">
      <span class="wave wave-1"></span>
      <span class="wave wave-2"></span>
      <span class="wave wave-3"></span>
    </span>
    <span class="device-icon device-right">💻</span>
  </div>
  <span class="button-label">Pair</span>
</button>

<style>
  .pair-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.1);
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .pair-button:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .pair-button:active {
    transform: translateY(0);
  }

  .pair-button.pairing {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border-color: #667eea;
    animation: pairing-pulse 2s ease-in-out infinite;
  }

  @keyframes pairing-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(102, 126, 234, 0);
    }
  }

  .icon-container {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
    height: 24px;
  }

  .device-icon {
    font-size: 1.1rem;
    line-height: 1;
    transition: transform 0.3s ease;
    z-index: 1;
  }

  .pair-button:hover .device-left {
    transform: translateX(-2px);
  }

  .pair-button:hover .device-right {
    transform: translateX(2px);
  }

  .pair-button.pairing .device-left {
    animation: device-pulse-left 1.5s ease-in-out infinite;
  }

  .pair-button.pairing .device-right {
    animation: device-pulse-right 1.5s ease-in-out infinite;
  }

  @keyframes device-pulse-left {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-3px); }
  }

  @keyframes device-pulse-right {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
  }

  .connection-waves {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 12px;
    height: 16px;
    position: relative;
  }

  .wave {
    display: block;
    width: 8px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 1px;
    opacity: 0.3;
    transition: opacity 0.3s ease;
  }

  .pair-button:hover .wave {
    opacity: 0.6;
  }

  .pair-button.pairing .wave {
    animation: wave-flow 0.8s ease-in-out infinite;
  }

  .wave-1 { animation-delay: 0s; }
  .wave-2 { animation-delay: 0.15s; }
  .wave-3 { animation-delay: 0.3s; }

  @keyframes wave-flow {
    0%, 100% {
      opacity: 0.2;
      transform: scaleX(0.6);
    }
    50% {
      opacity: 1;
      transform: scaleX(1);
    }
  }

  .button-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: #667eea;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Hide on mobile/small screens */
  @media (max-width: 768px) {
    .pair-button {
      display: none;
    }
  }
</style>
