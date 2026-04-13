<script lang="ts">
  import { 
    getAccumulation,
    isAccumulating,
    bitCount,
    commit
  } from '$lib/stores/accumulatingPost.svelte';
  import { loadPosts } from '$lib/stores/posts.svelte';

  // Visual state from store
  let isAccumulatingValue = $derived(isAccumulating());
  let bitCountValue = $derived(bitCount());
  let accumulationValue = $derived(getAccumulation());

  // Drafts are now handled at component level, no session storage needed

  async function handleClick() {
    if (isAccumulatingValue) {
      // Commit the accumulation
      const post = await commit();
      if (post) {
        // Reload posts to show new one
        await loadPosts();
      }
    }
  }

  function handleLongPress() {
    // TODO
    console.log('Long press - quick capture');
  }

  let pressTimer: ReturnType<typeof setTimeout>;
  const LONG_PRESS_DURATION = 600;

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
  class:accumulating={isAccumulatingValue}
  class:ready={isAccumulatingValue && bitCountValue > 0}
  onclick={handleClick}
  onpointerdown={onPointerDown}
  onpointerup={onPointerUp}
  onpointerleave={onPointerLeave}
  aria-label={isAccumulatingValue ? 'Commit post' : 'Staging area'}
  disabled={!isAccumulatingValue}
>
  <div class="outer-ring" class:has-content={isAccumulatingValue}>
    <div class="inner-circle">
      {#if isAccumulatingValue}
        <span class="bit-count">{bitCountValue}</span>
        <span class="commit-hint">Tap to post</span>
      {:else}
        <span class="placeholder-icon emoji">✦</span>
      {/if}
    </div>
  </div>
  
  <!-- Staged bits preview - arranged around the CCCB -->
  {#if isAccumulatingValue}
    <div class="staged-bits">
      {#each accumulationValue.bits.slice(0, 4) as bit, i}
        <div class="staged-bit staged-bit--{i}" title={bit.type}>
          {#if bit.type === 'text'}
            <span class="bit-preview text-preview">"{bit.content.slice(0, 15)}..."</span>
          {:else if bit.type === 'link'}
            <span class="bit-preview link-preview">🔗 {bit.preview?.title || bit.uri.slice(0, 20)}</span>
          {:else if bit.type === 'media'}
            <div class="media-thumb">📷</div>
          {:else if bit.type === 'person'}
            <span class="person-chip">@{bit.displayName}</span>
          
          {/if}
        </div>
      {/each}
      {#if accumulationValue.bits.length > 4}
        <div class="more-bits">+{accumulationValue.bits.length - 4}</div>
      {/if}
    </div>
  {/if}
</button>

<style>
  .capture-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 2;
  }

  .capture-button:disabled {
    cursor: default;
  }

  .capture-button:not(:disabled):active {
    transform: scale(0.95);
  }

  .capture-button.ready {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.1); }
  }

  .outer-ring {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .outer-ring.has-content {
    width: 100px;
    height: 100px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.25);
  }

  .inner-circle {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    color: white;
  }

  .outer-ring.has-content .inner-circle {
    width: 88px;
    height: 88px;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .placeholder-icon {
    font-size: 2rem;
    opacity: 0.5;
  }

  .bit-count {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
  }

  .commit-hint {
    font-size: 0.65rem;
    font-weight: 500;
    opacity: 0.9;
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Staged bits - arranged in a row above the CCCB */
  .staged-bits {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-bottom: 16px;
    min-width: 200px;
    pointer-events: none;
  }

  .staged-bit {
    background: white;
    border-radius: 20px;
    padding: 8px 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    font-size: 0.85rem;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    animation: slide-in 0.3s ease-out;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .text-preview {
    color: #444;
    font-style: italic;
  }

  .link-preview {
    color: #667eea;
  }

  .media-thumb {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .person-chip {
    background: #f0f0f0;
    padding: 4px 12px;
    border-radius: 16px;
    font-weight: 500;
  }

  .clip-badge {
    background: #1a1a2e;
    color: white;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
  }

  .more-bits {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }
</style>
