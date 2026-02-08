/**
 * Views Store
 * 
 * Manages the Reel of Views:
 * - View 0: The Feed™ (chronological, no filters, no close button)
 * - View 1..N: Child Views with filters, closable
 * 
 * Philosophy: Multiple lenses on the same accumulated becoming.
 */

import type { Post } from '$lib/types/post';
import { getPostsNewestFirst } from './posts.svelte';

// Types
export type ViewId = string;

export type SortBy = 'recent' | 'oldest';

export interface ViewFilters {
  // Time-based
  dateFrom?: Date;
  dateTo?: Date;
  
  // Content-based
  keywords?: string[];
  tags?: string[];
  
  // Connection-based
  mentionedPeople?: string[];
  relatedToPostId?: string;
  
  // Bit-type filters
  hasMedia?: boolean;
  hasLinks?: boolean;
  hasPeople?: boolean;
}

export interface View {
  id: ViewId;
  index: number;           // Position in reel (0 = The Feed™)
  filters: ViewFilters;
  sortBy: SortBy;
  label?: string;          // "Search: coffee", "Nov 2023"
  createdAt: Date;
}

// Reactive state
let views = $state<View[]>([createFeedView()]);
let activeViewIndex = $state(0);

// Create The Feed™ (View 0)
function createFeedView(): View {
  return {
    id: 'feed',
    index: 0,
    filters: {},
    sortBy: 'recent',
    label: 'Feed',
    createdAt: new Date()
  };
}

// Generate label from filters
function generateLabel(filters: ViewFilters): string | undefined {
  if (filters.keywords?.length) {
    return `Search: ${filters.keywords.join(', ').slice(0, 30)}`;
  }
  if (filters.dateFrom || filters.dateTo) {
    const from = filters.dateFrom?.toLocaleDateString('en-US', { month: 'short' });
    const to = filters.dateTo?.toLocaleDateString('en-US', { month: 'short' });
    if (from && to) return `${from}–${to}`;
    if (from) return `After ${from}`;
    if (to) return `Before ${to}`;
  }
  if (filters.relatedToPostId) {
    return 'Related';
  }
  return undefined;
}

// Generate unique ID
function generateViewId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Getters
export function getViews(): View[] {
  return views;
}

export function getActiveViewIndex(): number {
  return activeViewIndex;
}

export function getCurrentView(): View {
  return views[activeViewIndex];
}

export function isFeedView(): boolean {
  return activeViewIndex === 0;
}

export function canGoLeft(): boolean {
  return activeViewIndex > 0;
}

export function canGoRight(): boolean {
  return activeViewIndex < views.length - 1;
}

export function getViewCount(): number {
  return views.length;
}

// Actions

/**
 * Create a new Child View
 */
export function createView(partialFilters?: Partial<ViewFilters>): View {
  const newView: View = {
    id: generateViewId(),
    index: views.length,
    filters: { ...partialFilters },
    sortBy: 'recent',
    label: generateLabel(partialFilters || {}),
    createdAt: new Date()
  };
  
  views = [...views, newView];
  return newView;
}

/**
 * Activate a view by index
 */
export function activateView(index: number): void {
  if (index >= 0 && index < views.length) {
    activeViewIndex = index;
  }
}

/**
 * Navigate left (to previous view)
 */
export function goLeft(): void {
  if (canGoLeft()) {
    activeViewIndex--;
  }
}

/**
 * Navigate right (to next view)
 */
export function goRight(): void {
  if (canGoRight()) {
    activeViewIndex++;
  }
}

/**
 * Close a Child View (index > 0)
 */
export function closeView(index: number): void {
  if (index <= 0 || index >= views.length) return;
  
  // Remove the view
  const newViews = views.filter((_, i) => i !== index);
  
  // Re-index remaining views
  views = newViews.map((v, i) => ({ ...v, index: i }));
  
  // Adjust active index if needed
  if (activeViewIndex === index) {
    // Closed the active view, go left
    activeViewIndex = Math.max(0, index - 1);
  } else if (activeViewIndex > index) {
    // Closed a view to the left, shift active index
    activeViewIndex--;
  }
}

/**
 * Update view filters
 */
export function updateViewFilters(index: number, filters: Partial<ViewFilters>): void {
  if (index < 0 || index >= views.length) return;
  
  views = views.map((v, i) => 
    i === index 
      ? { ...v, filters: { ...v.filters, ...filters }, label: generateLabel({ ...v.filters, ...filters }) }
      : v
  );
}

/**
 * Close all Child Views, return to Feed
 */
export function closeAllChildViews(): void {
  views = [views[0]];
  activeViewIndex = 0;
}

// Filter posts for a view
export function getPostsForView(view: View): Post[] {
  let posts = getPostsNewestFirst();
  const filters = view.filters;
  
  // Date filters
  if (filters.dateFrom) {
    posts = posts.filter(p => p.createdAt >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    posts = posts.filter(p => p.createdAt <= filters.dateTo!);
  }
  
  // Keyword search (searches in text bits)
  if (filters.keywords?.length) {
    const keywords = filters.keywords.map(k => k.toLowerCase());
    posts = posts.filter(p => 
      p.bits.some(bit => {
        if (bit.type === 'text') {
          return keywords.some(kw => bit.content.toLowerCase().includes(kw));
        }
        if (bit.type === 'link') {
          return keywords.some(kw => 
            bit.url.toLowerCase().includes(kw) ||
            bit.preview?.title?.toLowerCase().includes(kw) ||
            bit.preview?.description?.toLowerCase().includes(kw)
          );
        }
        return false;
      })
    );
  }
  
  // People filters
  if (filters.mentionedPeople?.length) {
    posts = posts.filter(p =>
      p.bits.some(bit =>
        bit.type === 'person' && filters.mentionedPeople!.includes(bit.did)
      )
    );
  }
  
  // Bit type filters
  if (filters.hasMedia) {
    posts = posts.filter(p => p.bits.some(b => b.type === 'media'));
  }
  if (filters.hasLinks) {
    posts = posts.filter(p => p.bits.some(b => b.type === 'link'));
  }
  if (filters.hasPeople) {
    posts = posts.filter(p => p.bits.some(b => b.type === 'person'));
  }
  
  // Sort
  if (view.sortBy === 'oldest') {
    posts = [...posts].reverse();
  }
  
  return posts;
}

// Debug
export function debugViews(): void {
  const current = views[activeViewIndex];
  console.log('Views:', {
    count: views.length,
    active: activeViewIndex,
    current: current?.label || 'Feed',
    all: views.map(v => ({ id: v.id, label: v.label, index: v.index }))
  });
}
