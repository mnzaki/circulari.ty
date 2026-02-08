/**
 * Session Store (Database-Backed)
 * 
 * Reactive session state backed by database for continuity.
 * Uses getter functions (Svelte 5 pattern for module-level state).
 */

import type { InputType, ISessionService } from '@repo/persistence';

// Reactive state
let foregroundPositionState = $state(15);
let activeInputState = $state<InputType>(null);
let feedScrollPositionState = $state(0);
let lastReadPostIdState = $state<string | null>(null);
let loadedState = $state(false);

// Service reference
let service: ISessionService | null = null;

// Getter functions
export const foregroundPosition = () => foregroundPositionState;
export const activeInput = () => activeInputState;
export const feedScrollPosition = () => feedScrollPositionState;
export const lastReadPostId = () => lastReadPostIdState;
export const isSessionLoaded = () => loadedState;

/**
 * Set the session service (called during app initialization)
 */
export function setSessionService(svc: ISessionService): void {
  service = svc;
}

/**
 * Load session state from database
 */
export async function loadSessionState(): Promise<void> {
  if (loadedState || !service) return;
  
  foregroundPositionState = await service.getForegroundPosition();
  activeInputState = await service.getActiveInput();
  feedScrollPositionState = await service.getFeedScrollPosition();
  lastReadPostIdState = await service.getLastReadPostId();
  
  loadedState = true;
}

/**
 * Save foreground position
 */
export async function saveForegroundPosition(position: number): Promise<void> {
  foregroundPositionState = position;
  if (!service) return;
  await service.setForegroundPosition(position);
}

/**
 * Save active input
 */
export async function saveActiveInput(input: InputType): Promise<void> {
  activeInputState = input;
  if (!service) return;
  await service.setActiveInput(input);
}

/**
 * Save scroll position
 */
export async function saveFeedScrollPosition(position: number): Promise<void> {
  feedScrollPositionState = position;
  if (!service) return;
  await service.setFeedScrollPosition(position);
}

/**
 * Save last read post
 */
export async function saveLastReadPostId(postId: string | null): Promise<void> {
  lastReadPostIdState = postId;
  if (!service) return;
  await service.setLastReadPostId(postId);
}
