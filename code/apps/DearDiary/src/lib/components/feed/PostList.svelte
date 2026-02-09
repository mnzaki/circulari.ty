<script lang="ts">
  import { VirtualList, type VLSlotSignature } from 'svelte-virtuallists';
  import SafePostCard from './SafePostCard.svelte';
  import type { Post } from '@repo/persistence';

  interface Props {
    posts: Post[];
  }

  let { posts }: Props = $props();

  // Post dimensions - must match CSS in PostCard.svelte
  const POST_MARGIN      =  16; // must match --post-margin
  const POST_PADDING     =  32;
  const POST_HEADER      =  16;
  const POST_MAX_HEIGHT  = 280;
  const POST_MIN_HEIGHT  = 120;
  const MEDIA_HEIGHT     = 100;
  const AVG_BIT_HEIGHT   =  36;
  const POST_EMPTY_SPACE =  POST_MARGIN + POST_PADDING + POST_HEADER - 4;

  const AVG_LINE_HEIGHT  =  22; // TODO match CSS var
  const AVG_CHAR_WIDTH   =  8; // TODO match CSS var
  const BIT_FLEX_GAP     =  12; // TODO match CSS var

  let CONTAINER_WIDTH = $state<number>();
  let CHARS_PER_LINE = $derived(CONTAINER_WIDTH ? (CONTAINER_WIDTH-64) /
                                AVG_CHAR_WIDTH : 75);

  // Calculate total height per item including margin
  // We use average height for estimation, clamped to bounds
  function sizingCalculator(_index: number, item: unknown): number {
    // Estimate based on bits, clamped to CSS bounds, and 50px header/padding
    const post = item as Post;
    let estimated = POST_EMPTY_SPACE /*+ POST_HEADER*/; // 72
    for (const b of post.bits) {
      if (b.type == 'media' || b.type === 'link') {
        estimated += MEDIA_HEIGHT
      } else if (b.type == 'text') {
        estimated += Math.ceil(b.content.length / CHARS_PER_LINE) * AVG_LINE_HEIGHT
      } else if (b.type == 'person') {
        estimated += 36
      } else if (b.type == 'spatiotemporal') {
        estimated += AVG_BIT_HEIGHT
      }
    }

    // and bit margins
    estimated += (post.bits.length-1) * BIT_FLEX_GAP;

    // Clamp to CSS min/max and add margin
    const clamped = Math.max(POST_MIN_HEIGHT, Math.min(POST_MAX_HEIGHT, estimated));
    return clamped;
  }
</script>

<div class="post-list" bind:clientWidth={CONTAINER_WIDTH}>
  {#if posts.length > 0}
    <VirtualList
      class="virtual-list"
      items={posts}
      {sizingCalculator}
    >
      {#snippet vl_slot({ item, index }: VLSlotSignature<Post>)}
        {#if item && item.id && item.createdAt && !isNaN(item.createdAt.getTime())}
          <SafePostCard post={item} />
        {:else}
          <div class="post-error">
            <span>⚠️ Invalid post data (index {index})</span>
          </div>
        {/if}
      {/snippet}
    </VirtualList>
  {:else}
    <div class="empty-state">
      <span class="empty-emoji">🌱</span>
      <p>Your feed is empty</p>
      <span class="empty-hint">Tap the CCCB to start accumulating</span>
    </div>
  {/if}
</div>

<style>
  .post-list {
    height: 100%;
    overflow: hidden;
  }

  .post-list :global(.virtual-list) {
    height: 100%;
    padding: 16px;
    padding-bottom: 32px;
  }

  .post-error {
    padding: 16px;
    background: rgba(255, 200, 200, 0.5);
    border: 1px solid rgba(255, 100, 100, 0.3);
    border-radius: 12px;
    margin-bottom: 16px;
    color: #c33;
    font-size: 0.9rem;
    min-height: 80px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #888;
    text-align: center;
    height: 100%;
  }

  .empty-emoji {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.7;
  }

  .empty-state p {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .empty-hint {
    font-size: 0.9rem;
    opacity: 0.7;
  }
</style>
