<script lang="ts">
  import type { Post, AccumulableBit } from '@o19/foundframe-front';

  interface Props {
    post: Post;
  }

  let { post }: Props = $props();

  // Validate post data
  function isValidPost(p: Post): boolean {
    return !!p &&
           typeof p.id === 'number' &&
           Array.isArray(p.bits) &&
           p.createdAt instanceof Date &&
           !isNaN(p.createdAt.getTime());
  }

  function formatDate(date: Date): string {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date';
    }
  }

  function renderBitPreview(bit: AccumulableBit): string {
    switch (bit.type) {
      case 'text':
        return bit.content.slice(0, 100) + (bit.content.length > 100 ? '...' : '');
      case 'link':
        return bit.preview?.title || bit.uri;
      case 'media':
        return '📷 Media';
      case 'person':
        return `@${bit.displayName}`;

      default:
        return 'Unknown';
    }
  }

  // Limit bits shown to fit within max height
  const MAX_BITS_SHOWN = 3;
  let displayedBits = $derived(post.bits?.slice(0, MAX_BITS_SHOWN) ?? []);
  let hasMoreBits = $derived((post.bits?.length ?? 0) > MAX_BITS_SHOWN);
</script>

{#if isValidPost(post)}
<article class="post-card" data-post-id={post.id}>
  <div class="post-header">
    <span class="post-date">{formatDate(post.createdAt)}</span>

  </div>

  <div class="post-bits">
    {#each displayedBits as bit, i (i)}
      <div class="bit bit--{bit.type}">
        {#if bit.type === 'text'}
          <p class="truncated-text">{bit.content}</p>
        {:else if bit.type === 'link'}
          <div class="link-preview">
            {#if bit.preview?.imageUri}
              <div class="link-image" style="background-image: url({bit.preview.imageUri})"></div>
            {/if}
            <div class="link-meta">
              <strong class="truncated-title">{bit.preview?.title || 'Link'}</strong>
              {#if bit.preview?.description}
                <span class="link-desc truncated-desc">{bit.preview.description}</span>
              {/if}
              <span class="link-url">{(() => { try { return new URL(bit.uri).hostname; } catch { return bit.uri || 'Invalid URL'; } })()}</span>
            </div>
          </div>
        {:else if bit.type === 'media'}
          <div class="media-placeholder">
            <span>📷</span>
          </div>
        {:else if bit.type === 'person'}
          <div class="person-chip">
            {#if bit.avatarUri}
              <img src={bit.avatarUri} alt="" class="person-avatar" />
            {:else}
              <div class="person-avatar person-avatar--placeholder">{bit.displayName[0]}</div>
            {/if}
            <span>{bit.displayName}</span>
          </div>
        {:else if bit.type === 'spatiotemporal'}
          <div class="clip-indicator">
            <span>🎬 {bit.region.t ? `${bit.region.t.toFixed(1)}s` : 'clip'}</span>
          </div>
        {/if}
      </div>
    {/each}
    {#if hasMoreBits}
      <div class="more-bits">+{post.bits.length - MAX_BITS_SHOWN} more</div>
    {/if}
  </div>
</article>
{:else}
  <div class="post-card post-card--invalid">
    <span>⚠️ Invalid post data</span>
  </div>
{/if}

<style>
  /* Configurable spacing between posts */
  :root {
    --post-margin: 16px;
  }

  .post-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: var(--post-margin);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    /* Fixed dimensions for virtual scrolling */
    min-height: 120px;
    max-height: 280px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .post-card--invalid {
    background: rgba(255, 200, 200, 0.5);
    border: 1px solid rgba(255, 100, 100, 0.3);
    color: #c33;
    min-height: 80px;
    max-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .post-date {
    font-size: 0.85rem;
    color: #888;
    font-weight: 500;
  }

  .link-count {
    font-size: 0.8rem;
    color: #667eea;
    font-weight: 500;
  }

  .post-bits {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
    flex: 1;
  }

  .bit {
    flex-shrink: 0;
  }

  .bit p {
    margin: 0;
    line-height: 1.5;
    color: #333;
    font-size: 0.95rem;
  }

  /* Text truncation */
  .truncated-text {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: 6em;
  }

  .truncated-title {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .truncated-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Link preview styling */
  .link-preview {
    border: 1px solid #eee;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .link-image {
    height: 80px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    background-size: cover;
    background-position: center;
  }

  .link-meta {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .link-meta strong {
    font-size: 0.9rem;
    color: #333;
  }

  .link-desc {
    font-size: 0.8rem;
    color: #666;
  }

  .link-url {
    font-size: 0.75rem;
    color: #667eea;
  }

  /* Media placeholder */
  .media-placeholder {
    aspect-ratio: 16/9;
    max-height: 100px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  /* Person chip */
  .person-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f0f0f0;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    align-self: flex-start;
  }

  .person-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .person-avatar--placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Clip indicator */
  .clip-indicator {
    background: #1a1a2e;
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    align-self: flex-start;
    display: inline-block;
  }

  /* More bits indicator */
  .more-bits {
    font-size: 0.85rem;
    color: #888;
    text-align: center;
    padding: 8px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
  }
</style>
