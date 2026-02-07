<script lang="ts">
  import CaptureButton from './CaptureButton.svelte';
  import PostList from './PostList.svelte';
  import { postsNewestFirst } from '$lib/stores/posts.svelte';

  // Configuration - all in vh units for consistency
  const PEEK_POSITION_VH = 15; // vh - peek position showing capture
  const FULL_POSITION_VH = 0;  // vh - full feed at top
  const TOP_SNAP_VH = 15;      // vh - snap to full if dragged above this
  const BOTTOM_SNAP_VH = 85;   // vh - snap to peek if dragged below this
  const DRAG_RESISTANCE = 0.85;
  const MIN_FEED_VISIBLE_VH = 15; // Minimum feed that must stay visible
  
  // State
  let translateY = $state(PEEK_POSITION_VH); // Current position in vh
  let isDragging = $state(false);
  let startClientY = $state(0);
  let startTranslateY = $state(PEEK_POSITION_VH);
  let scrollContainer: HTMLElement;
  let windowHeight = $state(0);

  // Max position (don't let feed slide off bottom)
  let maxTranslateVh = $derived(100 - MIN_FEED_VISIBLE_VH);

  function handlePointerDown(e: PointerEvent) {
    const target = e.target as HTMLElement;
    const isHandle = target.closest('.drag-handle');
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    
    // Allow drag if clicking handle, or if near top with no scroll
    if (!isHandle && scrollTop > 5) return;
    if (!isHandle && translateY < 5) return;
    
    isDragging = true;
    startClientY = e.clientY;
    startTranslateY = translateY;
    
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startClientY;
    const deltaVh = (deltaY / windowHeight) * 100;
    
    // Apply resistance for natural feel
    let newTranslateY = startTranslateY + deltaVh * DRAG_RESISTANCE;
    
    // Clamp to valid range
    newTranslateY = Math.max(FULL_POSITION_VH, Math.min(newTranslateY, maxTranslateVh));
    
    translateY = newTranslateY;
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    
    // Snap logic using vh units directly
    if (translateY < TOP_SNAP_VH) {
      // In top zone - snap to full
      translateY = FULL_POSITION_VH;
    } else if (translateY > BOTTOM_SNAP_VH) {
      // In bottom zone - snap to peek
      translateY = PEEK_POSITION_VH;
    }
    // Otherwise: stay at current position (free placement)
  }
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div 
  class="feed-layer"
  class:dragging={isDragging}
  style="transform: translateY({translateY}vh)"
>
  <!-- Drag Handle Area with Capture Button -->
  <div 
    class="drag-handle"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
  >
    <div class="drag-indicator"></div>
    <div class="capture-button-container">
      <CaptureButton />
    </div>
  </div>

  <!-- Scrollable Feed Content -->
  <div 
    class="feed-scroll-area"
    bind:this={scrollContainer}
  >
    <PostList posts={postsNewestFirst} />
  </div>
</div>

<style>
  .feed-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: #f8f8f8;
    border-radius: 24px 24px 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    /* Start at peek position */
    transform: translateY(15vh);
    will-change: transform;
  }

  .feed-layer.dragging {
    transition: none;
  }

  .drag-handle {
    flex-shrink: 0;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 12px;
    cursor: grab;
    touch-action: none;
    user-select: none;
    position: relative;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .drag-indicator {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin-bottom: 8px;
  }

  .capture-button-container {
    position: absolute;
    top: 28px;
  }

  .feed-scroll-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .feed-scroll-area::-webkit-scrollbar {
    display: none;
  }
</style>
