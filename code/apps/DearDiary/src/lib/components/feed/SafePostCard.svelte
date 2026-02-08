<script lang="ts">
  import ErrorBoundary from '../ErrorBoundary.svelte';
  import PostCard from './PostCard.svelte';
  import type { Post } from '@repo/persistence';

  interface Props {
    post: Post;
  }

  let { post }: Props = $props();
</script>

<ErrorBoundary>
  <PostCard {post} />
</ErrorBoundary>
