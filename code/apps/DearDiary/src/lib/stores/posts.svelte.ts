import type { Post } from '$lib/types/post';
import type { AccumulableBit } from '$lib/types/xanadu';

/**
 * The Posts Store
 * 
 * Manages the committed feed of posts.
 * Future: backed by local-first storage, CRDT sync, content-addressed retrieval.
 * Present: in-memory array with reactive updates.
 */

// Reactive state
let posts = $state<Post[]>([]);

// Derived values (exported as getters since $derived can't be exported from modules)
export function getPostCount(): number {
  return posts.length;
}

export function getLatestPost(): Post | null {
  return posts[posts.length - 1] ?? null;
}

export function getPostsNewestFirst(): Post[] {
  return [...posts].reverse();
}

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

// Mock data for development/demo
export function loadMockPosts(): void {
  const mockBits: AccumulableBit[][] = [
    [
      { type: 'text', content: 'Had an amazing day exploring the city! Found this hidden coffee shop with the best latte art.' },
      { type: 'media', uri: 'mock://coffee.jpg', mimeType: 'image/jpeg' }
    ],
    [
      { type: 'text', content: 'Working on this new project and it\'s coming together nicely.' },
      { type: 'link', url: 'https://svelte.dev', preview: { title: 'Svelte • Cybernetically enhanced web apps', description: 'Svelte is a radical new approach to building user interfaces', siteName: 'svelte.dev' } }
    ],
    [
      { type: 'text', content: 'Just finished reading an incredible book. The ending was completely unexpected!' },
      { type: 'person', did: 'did:mock:alice', displayName: 'Alice' }
    ],
    [
      { type: 'text', content: 'Morning thoughts: The best time to start was yesterday. The second best time is now.' }
    ],
    [
      { type: 'media', uri: 'mock://sunset.jpg', mimeType: 'image/jpeg' },
      { type: 'text', content: 'Golden hour hits different when you\'re not looking at it through a screen.' }
    ],
    [
      { type: 'text', content: 'Dinner with friends tonight. Grateful for these moments.' },
      { type: 'person', did: 'did:mock:bob', displayName: 'Bob' },
      { type: 'person', did: 'did:mock:carol', displayName: 'Carol' }
    ],
    [
      { type: 'link', url: 'https://xanadu.com', preview: { title: 'Project Xanadu', description: 'The original hypertext project', siteName: 'xanadu.com' } },
      { type: 'text', content: 'Thinking a lot about transclusion and fine-grained addressing lately...' }
    ],
    [
      { type: 'text', content: 'Late night coding session. There\'s something meditative about watching tests pass.' }
    ]
  ];

  const mockPosts: Post[] = mockBits.map((bits, i) => ({
    id: `mock-${i}`,
    bits,
    links: [],
    createdAt: new Date(Date.now() - (i * 1000 * 60 * 60 * 6)) // Each 6 hours apart
  }));

  posts = mockPosts;
}
