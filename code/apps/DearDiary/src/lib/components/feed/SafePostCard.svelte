<script lang="ts">
  import ErrorBoundary from '../ErrorBoundary.svelte';
  import PostCard from './PostCard.svelte';
  import type { Post } from '@o19/foundframe';

  interface Props {
    post: Post;
  }

  let { post }: Props = $props();
</script>

<ErrorBoundary>
  <PostCard {post} />
</ErrorBoundary>
