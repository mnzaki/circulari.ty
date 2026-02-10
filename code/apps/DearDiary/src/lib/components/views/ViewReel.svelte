<script lang="ts">
  import {
    getViews,
    activeViewIndex,
    canGoLeft,
    canGoRight,
    goLeft,
    goRight,
    activateView,
    createView,
    closeView
  } from '$lib/stores/views.svelte';
  import { posts, loadPosts } from '$lib/stores/posts.svelte';
  import PostList from '$lib/components/feed/PostList.svelte';

  // Local state for new view configuration
  let showNewViewPanel = $state(false);
  let searchQuery = $state('');

  // Get reactive values from stores (using getter functions)
  let views = $derived(getViews());
  let activeIndex = $derived(activeViewIndex());

  // Load posts on mount (only once)
  let mounted = $state(false);
  $effect(() => {
    if (!mounted) {
      mounted = true;
      loadPosts().catch(err => console.error('Failed to load posts:', err));
    }
  });

  // Get posts for current view
  let currentPosts = $derived(posts());

  // Handle creating a new view from search
  function handleCreateSearchView() {
    if (!searchQuery.trim()) return;

    createView({
      keywords: [searchQuery.trim()]
    });

    searchQuery = '';
    showNewViewPanel = false;

    // Navigate to the new view (last one)
    activateView(views.length - 1);
  }

  // Handle swipe gesture
  let touchStartX = $state(0);
  let touchEndX = $state(0);
  const SWIPE_THRESHOLD = 50;

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e: TouchEvent) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && canGoLeft()) {
        goLeft();
      } else if (swipeDistance < 0 && canGoRight()) {
        goRight();
      }
    }
  }
</script>

<div
  class="view-reel"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>
  <!-- Views Container - Transforms to show active view -->
  <div
    class="views-container"
    style="transform: translateX(-{activeIndex * 100}%)"
  >
    {#each views as view, i (view.id)}
      <div class="view" class:active={i === activeIndex}>
        <!-- View Header -->
        <div class="view-header">
          <div class="view-label">
            {#if view.label}
              <span class="label-text">{view.label}</span>
            {:else if i === 0}
              <span class="label-default">Feed</span>
            {:else}
              <span class="label-default">View {i}</span>
            {/if}
          </div>

          <div class="view-actions">
            {#if i > 0}
              <!-- Only Child Views can be closed -->
              <button
                class="close-btn"
                onclick={() => closeView(i)}
                aria-label="Close view"
              >
                ×
              </button>
            {:else}
              <span class="feed-badge">Feed</span>
            {/if}
          </div>
        </div>

        <!-- View Content -->
        <div class="view-content">
          {#key i}
            {#if i === activeIndex}
              <PostList posts={currentPosts} />
            {:else}
              <div class="view-inactive">
                <span>Inactive view</span>
              </div>
            {/if}
          {/key}
        </div>
      </div>
    {/each}
  </div>

  <!-- Reel Indicator (dots) -->
  <div class="reel-indicator">
    {#each views as _, i}
      <button
        class="dot"
        class:active={i === activeIndex}
        onclick={() => activateView(i)}
        aria-label="Go to view {i + 1}"
      ></button>
    {/each}

    <!-- New View button -->
    <button
      class="new-view-btn"
      onclick={() => showNewViewPanel = true}
      aria-label="Create new view"
    >
      +
    </button>
  </div>

  <!-- New View Panel (overlay) -->
  {#if showNewViewPanel}
    <div class="new-view-panel">
      <div class="panel-content">
        <h3>New View</h3>

        <div class="search-input-wrapper">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search keywords..."
            class="search-input"
            onkeydown={(e) => e.key === 'Enter' && handleCreateSearchView()}
          />
        </div>

        <div class="panel-actions">
          <button class="btn-secondary" onclick={() => showNewViewPanel = false}>
            Cancel
          </button>
          <button
            class="btn-primary"
            onclick={handleCreateSearchView}
            disabled={!searchQuery.trim()}
          >
            Create View
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .view-reel {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Views Container - Holds all views side by side */
  .views-container {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Individual View */
  .view {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* View Header */
  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
  }

  .view-label {
    font-weight: 600;
    color: #333;
  }

  .label-text {
    color: #667eea;
  }

  .label-default {
    color: #888;
  }

  .view-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.08);
    color: #666;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .close-btn:hover {
    background: rgba(0, 0, 0, 0.15);
    color: #333;
  }

  .feed-badge {
    font-size: 0.7rem;
    font-weight: 700;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* View Content */
  .view-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  /* Reel Indicator */
  .reel-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 12px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: #ddd;
    cursor: pointer;
    transition: all 0.2s;
    padding: 0;
  }

  .dot.active {
    background: #667eea;
    transform: scale(1.3);
  }

  .new-view-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #667eea;
    background: transparent;
    color: #667eea;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    transition: all 0.15s;
  }

  .new-view-btn:hover {
    background: #667eea;
    color: white;
  }

  /* New View Panel */
  .new-view-panel {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .panel-content {
    background: white;
    padding: 24px;
    border-radius: 20px;
    width: 90%;
    max-width: 360px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    animation: slide-up 0.3s ease-out;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .panel-content h3 {
    margin: 0 0 16px;
    font-size: 1.3rem;
    color: #333;
  }

  .search-input-wrapper {
    margin-bottom: 20px;
  }

  .search-input {
    width: 100%;
    padding: 14px 18px;
    border: 2px solid #e0e0e0;
    border-radius: 14px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .panel-actions {
    display: flex;
    gap: 10px;
  }

  .btn-secondary,
  .btn-primary {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
  }

  .btn-secondary {
    background: #f0f0f0;
    color: #666;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .view-inactive {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    font-size: 0.9rem;
  }
</style>
