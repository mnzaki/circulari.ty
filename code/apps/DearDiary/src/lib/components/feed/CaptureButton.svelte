<script lang="ts">
  import { 
    getAccumulation, 
    hasAccumulation, 
    getBitCount,
    commit,
    addBit 
  } from '$lib/stores/accumulatingPost.svelte';
  import { addPost } from '$lib/stores/posts.svelte';
  import type { AccumulableBit } from '$lib/types/xanadu';

  // Visual state
  let isAccumulating = $derived(hasAccumulation());
  let bitCount = $derived(getBitCount());
  let accumulation = $derived(getAccumulation());

  function handleClick() {
    if (isAccumulating) {
      // Commit the accumulation
      const post = commit();
      if (post) {
        addPost(post);
      }
    } else {
      // Start accumulation with a text bit (placeholder)
      // In real UI, this would open the appropriate input
      addBit({
        type: 'text',
        content: 'New thought...'
      });
    }
  }

  function handleLongPress() {
    // Future: capture photo/video
    console.log('Long press - capture media');
  }

  let pressTimer: ReturnType<typeof setTimeout>;
  const LONG_PRESS_DURATION = 500;

  function onPointerDown() {
    pressTimer = setTimeout(() => {
      handleLongPress();
    }, LONG_PRESS_DURATION);
  }

  function onPointerUp() {
    clearTimeout(pressTimer);
  }

  function onPointerLeave() {
    clearTimeout(pressTimer);
  }
</script>

<button 
  class="capture-button"
  class:accumulating={isAccumulating}
  onclick={handleClick}
  onpointerdown={onPointerDown}
  onpointerup={onPointerUp}
  onpointerleave={onPointerLeave}
  aria-label={isAccumulating ? 'Commit post' : 'Start capture'}
>
  <div class="outer-ring" class:has-content={isAccumulating}>
    <div class="inner-circle">
      {#if isAccumulating}
        <span class="bit-indicator">{bitCount}</span>
      {:else}
        <span class="capture-icon">+</span>
      {/if}
    </div>
  </div>
  
  <!-- Accumulation preview (tiny bits orbiting or stacked) -->
  {#if isAccumulating}
    <div class="accumulation-preview">
      {#each accumulation.bits.slice(0, 3) as bit, i}
        <div class="mini-bit mini-bit--{i}">
          {#if bit.type === 'text'}📝
          {:else if bit.type === 'link'}🔗
          {:else if bit.type === 'media'}📷
          {:else if bit.type === 'person'}👤
          {:else if bit.type === 'spatiotemporal'}🎬
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</button>

<style>
  .capture-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.15s ease;
    position: relative;
  }

  .capture-button:active {
    transform: scale(0.95);
  }

  .outer-ring {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .outer-ring.has-content {
    width: 72px;
    height: 72px;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  }

  .inner-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .outer-ring.has-content .inner-circle {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .capture-icon {
    color: white;
    font-size: 1.8rem;
    font-weight: 300;
    line-height: 1;
  }

  .bit-indicator {
    color: white;
    font-size: 1.4rem;
    font-weight: 600;
  }

  /* Accumulation preview - tiny bits floating around */
  .accumulation-preview {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .mini-bit {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    animation: orbit 2s ease-in-out infinite;
  }

  .mini-bit--0 {
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: 0s;
  }

  .mini-bit--1 {
    top: -20px;
    right: -35px;
    animation-delay: 0.2s;
  }

  .mini-bit--2 {
    top: -20px;
    left: -35px;
    animation-delay: 0.4s;
  }

  @keyframes orbit {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-3px) scale(1.05); }
  }
</style>
