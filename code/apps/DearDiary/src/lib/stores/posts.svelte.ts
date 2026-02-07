import type { Post } from '$lib/types/post';

/**
 * The Posts Store
 * 
 * Manages the committed feed of posts.
 * Future: backed by local-first storage, CRDT sync, content-addressed retrieval.
 * Present: in-memory array with reactive updates.
 */

// Reactive state
let posts = $state<Post[]>([]);

// Derived
export const postCount = $derived(posts.length);
export const latestPost = $derived(posts[posts.length - 1] ?? null);

// Sorted by newest first
export const postsNewestFirst = $derived([...posts].reverse());

// Read-only access
export function getPosts(): Post[] {
  return posts;
}

export function getPostById(id: string): Post | undefined {
  return posts.find(p => p.id === id);
}

// Actions

/**
 * Add a post to the feed
 * Newest posts appear at the end of the array (chronological)
 * UI displays reversed (newest first)
 */
export function addPost(post: Post): void {
  posts = [...posts, post];
}

/**
 * Remove a post by ID
 */
export function removePost(id: string): void {
  posts = posts.filter(p => p.id !== id);
}

/**
 * Update a post (for future edit functionality)
 */
export function updatePost(id: string, updates: Partial<Post>): void {
  posts = posts.map(p => 
    p.id === id ? { ...p, ...updates, modifiedAt: new Date() } : p
  );
}

/**
 * Load posts (future: from local storage / sync)
 */
export function loadPosts(loadedPosts: Post[]): void {
  posts = loadedPosts;
}

/**
 * Clear all posts (nuclear option)
 */
export function clearPosts(): void {
  posts = [];
}

// Debug
export function debugPosts(): void {
  console.log('Posts:', {
    count: posts.length,
    ids: posts.map(p => p.id)
  });
}
