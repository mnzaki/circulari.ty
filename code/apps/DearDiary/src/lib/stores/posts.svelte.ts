/**
 * Posts Store (Database-Backed)
 *
 * Reactive store for posts, backed by the database.
 * Uses $effect for reactive updates and service layer for persistence.
 */

import type { Post, AccumulableBit } from '@o19/foundframe-front';
import type { PostPort } from '@o19/foundframe-front';

// Reactive state
let postsState = $state<Post[]>([]);
let loadingState = $state(false);
let service: PostPort | null = null;

// Derived (getter functions - cannot export $derived from modules)
export const postCount = () => postsState.length;
export const latestPost = () => postsState[postsState.length - 1] ?? null;
export const postsNewestFirst = () => [...postsState].reverse();
export const posts = () => postsState;
export const loading = () => loadingState;

/**
 * Set the post service (called during app initialization)
 */
export function setPostService(svc: PostPort): void {
  service = svc;
}

/**
 * Load posts from database
 */
export async function loadPosts(): Promise<void> {
  if (!service) {
    console.log('[posts] Service not available yet');
    return;
  }

  loadingState = true;
  try {
    postsState = await service.query();
  } finally {
    loadingState = false;
  }
}

/**
 * Add a new post from bits
 */
export async function addPost(bits: AccumulableBit[]): Promise<Post> {
  if (!service) {
    throw new Error('[posts] Service not initialized');
  }

  const post = await service.create({ bits });
  postsState = [...postsState, post];
  return post;
}

/**
 * Remove a post by ID
 */
export async function removePost(id: number): Promise<void> {
  if (!service) return;

  await service.delete(id);
  postsState = postsState.filter((p) => p.id !== id);
}

/**
 * Update a post
 */
export async function updatePost(id: number, updates: { bits?: AccumulableBit[] }): Promise<void> {
  if (!service) return;

  await service.update(id, updates);
  postsState = postsState.map((p) =>
    p.id === id ? { ...p, ...updates, modifiedAt: new Date() } : p
  );
}

/**
 * Search posts by keyword
 */
export async function searchPosts(keyword: string): Promise<Post[]> {
  if (!service) return [];
  return service.searchByKeyword(keyword);
}

/**
 * Get posts by date range
 */
export async function getPostsByDateRange(from: Date, to: Date): Promise<Post[]> {
  if (!service) return [];
  return service.query({ dateFrom: from, dateTo: to });
}

/**
 * Load mock posts for demo (only if database is empty)
 */
export async function loadMockPosts(): Promise<void> {
  if (!service) return;

  const count = await service.count();
  if (count > 0) {
    console.log('Database already has posts, skipping mock data');
    await loadPosts();
    return;
  }

  // Mock data
  const mockBits = [
    [
      {
        type: 'text' as const,
        content:
          'Had an amazing day exploring the city! Found this hidden coffee shop with the best latte art.'
      },
      { type: 'media' as const, uri: 'mock://coffee.jpg', mimeType: 'image/jpeg' }
    ],
    [
      {
        type: 'text' as const,
        content: "Working on this new project and it's coming together nicely."
      },
      {
        type: 'link' as const,
        uri: 'https://svelte.dev',
        preview: {
          title: 'Svelte • Cybernetically enhanced web apps',
          description: 'Svelte is a radical new approach to building user interfaces',
          siteName: 'svelte.dev'
        }
      }
    ],
    [
      {
        type: 'text' as const,
        content: 'Just finished reading an incredible book. The ending was completely unexpected!'
      },
      { type: 'person' as const, did: 'did:mock:alice', displayName: 'Alice' }
    ],
    [
      {
        type: 'text' as const,
        content:
          'Morning thoughts: The best time to start was yesterday. The second best time is now.'
      }
    ],
    [
      { type: 'media' as const, uri: 'mock://sunset.jpg', mimeType: 'image/jpeg' },
      {
        type: 'text' as const,
        content: "Golden hour hits different when you're not looking at it through a screen."
      }
    ],
    [
      {
        type: 'text' as const,
        content: 'Dinner with friends tonight. Grateful for these moments.'
      },
      { type: 'person' as const, did: 'did:mock:bob', displayName: 'Bob' },
      { type: 'person' as const, did: 'did:mock:carol', displayName: 'Carol' }
    ],
    [
      {
        type: 'link' as const,
        uri: 'https://xanadu.com',
        preview: {
          title: 'Project Xanadu',
          description: 'The original hypertext project',
          siteName: 'xanadu.com'
        }
      },
      {
        type: 'text' as const,
        content: 'Thinking a lot about transclusion and fine-grained addressing lately...'
      }
    ],
    [
      {
        type: 'text' as const,
        content:
          "Late night coding session. There's something meditative about watching tests pass."
      }
    ]
  ];

  for (let i = 0; i < mockBits.length; i++) {
    await service.create({ bits: mockBits[i] as AccumulableBit[] });
  }

  await loadPosts();
}

/**
 * Clear all posts
 */
export async function clearPosts(): Promise<void> {
  for (const post of postsState) {
    await service!.delete(post.id);
  }
  postsState = [];
}

/**
 * Get posts for a view (with filters)
 */
export async function getPostsForView(view: {
  filters: { dateFrom?: Date; dateTo?: Date; keywords?: string[] };
}): Promise<Post[]> {
  if (!service) return [];

  if (!view.filters || Object.keys(view.filters).length === 0) {
    return service.query();
  }

  let results = await service.query({
    dateFrom: view.filters.dateFrom,
    dateTo: view.filters.dateTo
  });

  if (view.filters.keywords?.length) {
    const keywords = view.filters.keywords.map((k) => k.toLowerCase());
    results = results.filter((post) =>
      post.bits.some((bit) => {
        if (bit.type === 'text') {
          return keywords.some((kw) => bit.content.toLowerCase().includes(kw));
        }
        if (bit.type === 'link') {
          return keywords.some(
            (kw) =>
              bit.uri.toLowerCase().includes(kw) || bit.preview?.title?.toLowerCase().includes(kw)
          );
        }
        return false;
      })
    );
  }

  return results;
}

// Debug
export function debugPosts(): void {
  console.log('Posts:', {
    count: postsState.length,
    ids: postsState.map((p) => p.id),
    loading: loadingState
  });
}
