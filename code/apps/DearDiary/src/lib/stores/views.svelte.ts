/**
 * Views Store (Database-Backed)
 * 
 * Manages the View Reel state, backed by database.
 * Uses getter functions (Svelte 5 pattern for module-level state).
 */

import type { View, ViewFilters, SortBy, ViewPort } from '@o19/foundframe';

export type { View, ViewFilters, SortBy } from '@o19/foundframe';

// Reactive state
let viewsState = $state<View[]>([]);
let activeViewIndexState = $state(0);
let loadedState = $state(false);

// Service reference
let service: ViewPort | null = null;

// Derived state
export const currentView = () => viewsState[activeViewIndexState];
export const isFeedView = () => activeViewIndexState === 0;
export const canGoLeft = () => activeViewIndexState > 0;
export const canGoRight = () => activeViewIndexState < viewsState.length - 1;
export const viewCount = () => viewsState.length;
export const activeViewIndex = () => activeViewIndexState;
export const loaded = () => loadedState;

export function getViews(): View[] {
  return viewsState;
}

export function getActiveViewIndex(): number {
  return activeViewIndexState;
}

/**
 * Set the view service (called during app initialization)
 */
export function setViewService(svc: ViewPort): void {
  service = svc;
}

/**
 * Load views from database
 */
export async function loadViews(): Promise<void> {
  if (!service) return;
  
  await service.getTheStream();
  const dbViews = await service.getAll();
  viewsState = dbViews;
  loadedState = true;
}

/**
 * Create a new Child View
 */
export async function createView(label: string, filters?: ViewFilters): Promise<View> {
  if (!service) throw new Error('View service not initialized');
  
  const newView = await service.create({ 
    label, 
    filters: filters ?? {},
    badge: 'SEARCH',
    sortBy: 'recent',
    isPinned: false,
    isTheStream: false,
    index: viewsState.length
  });
  await loadViews();
  activeViewIndexState = viewsState.length - 1;
  return newView;
}

/**
 * Activate a view by index
 */
export function activateView(index: number): void {
  if (index >= 0 && index < viewsState.length) {
    activeViewIndexState = index;
  }
}

/**
 * Navigate left
 */
export function goLeft(): void {
  if (canGoLeft()) {
    activeViewIndexState--;
  }
}

/**
 * Navigate right
 */
export function goRight(): void {
  if (canGoRight()) {
    activeViewIndexState++;
  }
}

/**
 * Close a Child View
 */
export async function closeView(index: number): Promise<void> {
  if (index <= 0 || !service) return;
  
  const view = viewsState[index];
  if (!view) return;
  
  await service.delete(view.id);
  await loadViews();
  
  if (activeViewIndexState === index) {
    activeViewIndexState = Math.max(0, index - 1);
  } else if (activeViewIndexState > index) {
    activeViewIndexState--;
  }
}

/**
 * Close all Child Views
 */
export async function closeAllChildViews(): Promise<void> {
  if (!service) return;
  
  // Close all views except TheStream (index 0)
  const childViews = viewsState.filter(v => v.id !== 0);
  for (const view of childViews) {
    await service!.delete(view.id);
  }
  await loadViews();
  activeViewIndexState = 0;
}
