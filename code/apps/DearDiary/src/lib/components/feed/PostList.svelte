<script lang="ts">
  import PostCard from './PostCard.svelte';
  import type { Post } from '$lib/types/post';

  interface Props {
    posts: Post[];
  }

  let { posts }: Props = $props();
</script>

<div class="post-list">
  {#each posts as post (post.id)}
    <PostCard {post} />
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
