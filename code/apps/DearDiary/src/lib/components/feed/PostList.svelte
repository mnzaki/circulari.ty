<script lang="ts">
  import SafePostCard from './SafePostCard.svelte';
  import type { Post } from '@repo/persistence';

  interface Props {
    posts: Post[];
  }

  let { posts }: Props = $props();
</script>

<div class="post-list">
  {#each posts as post, i (post.id)}
    {#key post.id}
      {#if post && post.id && post.createdAt && !isNaN(post.createdAt.getTime())}
        <SafePostCard {post} />
      {:else}
        <div class="post-error">
          <span>⚠️ Invalid post data (index {i})</span>
        </div>
      {/if}
    {/key}
  {:else}
    <div class="empty-state">
      <span class="empty-emoji">🌱</span>
      <p>Your feed is empty</p>
      <span class="empty-hint">Tap the CCCB to start accumulating</span>
    </div>
  {/each}
</div>

<style>
  .post-list {
    padding: 16px;
    padding-bottom: 32px;
  }

  .post-error {
    padding: 16px;
    background: rgba(255, 200, 200, 0.5);
    border: 1px solid rgba(255, 100, 100, 0.3);
    border-radius: 12px;
    margin-bottom: 12px;
    color: #c33;
    font-size: 0.9rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #888;
    text-align: center;
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
