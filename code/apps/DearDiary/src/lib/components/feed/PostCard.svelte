<script lang="ts">
  import type { Post, AccumulableBit } from '@repo/persistence';

  interface Props {
    post: Post;
  }

  let { post }: Props = $props();

  // Validate post data
  function isValidPost(p: Post): boolean {
    return !!p && 
           typeof p.id === 'string' && 
           Array.isArray(p.bits) && 
           p.createdAt instanceof Date && 
           !isNaN(p.createdAt.getTime());
  }

  function formatDate(date: Date): string {
    try {
      // Validate date before formatting
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
        return bit.preview?.title || bit.url;
      case 'media':
        return '📷 Media';
      case 'person':
        return `@${bit.displayName}`;
      case 'spatiotemporal':
        return '🎬 Clip';
      default:
        return 'Unknown';
    }
  }
</script>

{#if isValidPost(post)}
<article class="post-card" data-post-id={post.id}>
  <div class="post-header">
    <span class="post-date">{formatDate(post.createdAt)}</span>
    {#if post.links.length > 0}
      <span class="link-count">{post.links.length} link{post.links.length > 1 ? 's' : ''}</span>
    {/if}
  </div>
  
  <div class="post-bits">
    {#each post.bits as bit, i (i)}
      <div class="bit bit--{bit.type}">
        {#if bit.type === 'text'}
          <p>{bit.content}</p>
        {:else if bit.type === 'link'}
          <div class="link-preview">
            {#if bit.preview?.imageUri}
              <div class="link-image" style="background-image: url({bit.preview.imageUri})"></div>
            {/if}
            <div class="link-meta">
              <strong>{bit.preview?.title || 'Link'}</strong>
              {#if bit.preview?.description}
                <span class="link-desc">{bit.preview.description.slice(0, 80)}...</span>
              {/if}
              <span class="link-url">{(() => { try { return new URL(bit.url).hostname; } catch { return bit.url || 'Invalid URL'; } })()}</span>
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
  </div>
</article>
{:else}
  <div class="post-card post-card--invalid">
    <span>⚠️ Invalid post data</span>
  </div>
{/if}

<style>
  .post-card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .post-card--invalid {
    background: rgba(255, 200, 200, 0.5);
    border: 1px solid rgba(255, 100, 100, 0.3);
    color: #c33;
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
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
  }

  .bit p {
    margin: 0;
    line-height: 1.6;
    color: #333;
    font-size: 0.95rem;
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
    height: 120px;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
    background-size: cover;
    background-position: center;
  }

  .link-meta {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .link-meta strong {
    font-size: 0.95rem;
    color: #333;
  }

  .link-desc {
    font-size: 0.85rem;
    color: #666;
  }

  .link-url {
    font-size: 0.8rem;
    color: #667eea;
  }

  /* Media placeholder */
  .media-placeholder {
    aspect-ratio: 16/9;
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
  }
</style>
