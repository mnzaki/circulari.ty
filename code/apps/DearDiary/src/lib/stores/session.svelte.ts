/**
 * Session Store
 * 
 * Reactive session state for continuity.
 * Uses localStorage for persistence.
 * Uses getter functions (Svelte 5 pattern for module-level state).
 */

import type { InputType } from '@o19/foundframe';

const STORAGE_KEY = 'deardiary_session_v2';

// Reactive state
let foregroundPositionState = $state(15);
let activeInputState = $state<InputType>(null);
let feedScrollPositionState = $state(0);
let lastReadPostIdState = $state<number | null>(null);
let loadedState = $state(false);

// Getter functions
export const foregroundPosition = () => foregroundPositionState;
export const activeInput = () => activeInputState;
export const feedScrollPosition = () => feedScrollPositionState;
export const lastReadPostId = () => lastReadPostIdState;
export const isSessionLoaded = () => loadedState;

// Load from localStorage
function loadFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      foregroundPositionState = parsed.foregroundPosition ?? 15;
      activeInputState = parsed.activeInput ?? null;
      feedScrollPositionState = parsed.feedScrollPosition ?? 0;
      lastReadPostIdState = parsed.lastReadPostId ?? null;
    }
  } catch (e) {
    console.warn('Failed to load session state:', e);
  }
}

// Save to localStorage
function saveToStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      foregroundPosition: foregroundPositionState,
      activeInput: activeInputState,
      feedScrollPosition: feedScrollPositionState,
      lastReadPostId: lastReadPostIdState
    }));
  } catch (e) {
    console.warn('Failed to save session state:', e);
  }
}

/**
 * Set the session service (no-op for localStorage-based implementation)
 */
export function setSessionService(_svc: unknown): void {
  // No service needed for localStorage implementation
}

/**
 * Load session state from localStorage
 */
export async function loadSessionState(): Promise<void> {
  if (loadedState) return;
  loadFromStorage();
  loadedState = true;
}

/**
 * Save foreground position
 */
export async function saveForegroundPosition(position: number): Promise<void> {
  foregroundPositionState = position;
  saveToStorage();
}

/**
 * Save active input
 */
export async function saveActiveInput(input: InputType): Promise<void> {
  activeInputState = input;
  saveToStorage();
}

/**
 * Save scroll position
 */
export async function saveFeedScrollPosition(position: number): Promise<void> {
  feedScrollPositionState = position;
  saveToStorage();
}

/**
 * Save last read post
 */
export async function saveLastReadPostId(postId: number | null): Promise<void> {
  lastReadPostIdState = postId;
  saveToStorage();
}
