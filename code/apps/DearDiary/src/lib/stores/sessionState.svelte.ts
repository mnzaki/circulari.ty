/**
 * Session State Store
 * 
 * Persists the ephemeral continuity of the user's journey across app restarts.
 * - Foreground layer position
 * - Input drafts
 * - Feed scroll position
 * - (Future) Search tab states
 * 
 * Philosophy: The app remembers where you last were, as you would.
 */

import type { InputType } from '@o19/foundframe-front';

const STORAGE_KEY = 'deardiary_session_state';

// Types
export interface InputDraftsState {
  text: string;
  link: string;
  person: { did: string; displayName: string; avatarUri?: string } | null;
}

export interface SessionState {
  // Spatial: Foreground layer position (vh translate)
  foregroundPosition: number;
  
  // Compositional: Input drafts
  inputDrafts: InputDraftsState;
  
  // Temporal: Feed scroll context
  feedScrollPosition: number;
  lastReadPostId: string | null;
  
  // UI: Last active input tab
  activeInput: InputType;
  
  // Camera: Whether camera is enabled (not just hidden)
  cameraEnabled: boolean;
  
  // User preferences
  handedness: 'left' | 'right';
  
  // Timestamp for debugging
  lastUpdated: number;
}

// Default state
const DEFAULT_STATE: SessionState = {
  foregroundPosition: 15, // Start at peek position
  inputDrafts: {
    text: '',
    link: '',
    person: null
  },
  feedScrollPosition: 0,
  lastReadPostId: null,
  activeInput: null,
  cameraEnabled: true, // Camera on by default
  handedness: 'right', // Right-handed by default
  lastUpdated: Date.now()
};

// Reactive state
let sessionState = $state<SessionState>(loadState());

// Load from localStorage
function loadState(): SessionState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle schema changes
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load session state:', e);
  }
  
  return DEFAULT_STATE;
}

// Save to localStorage
function saveState() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...sessionState,
      lastUpdated: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save session state:', e);
  }
}

// Getters
export function getForegroundPosition(): number {
  return sessionState.foregroundPosition;
}

export function getInputDrafts(): InputDraftsState {
  return sessionState.inputDrafts;
}

export function getFeedScrollPosition(): number {
  return sessionState.feedScrollPosition;
}

export function getLastReadPostId(): string | null {
  return sessionState.lastReadPostId;
}

export function getActiveInput(): InputType {
  return sessionState.activeInput;
}

export function getCameraEnabled(): boolean {
  return sessionState.cameraEnabled;
}

export function getHandedness(): 'left' | 'right' {
  return sessionState.handedness;
}

// Setters - each saves to localStorage after updating state
export function setForegroundPosition(position: number): void {
  sessionState.foregroundPosition = position;
  saveState();
}

export function setInputDraft(type: keyof InputDraftsState, value: string | InputDraftsState['person']): void {
  sessionState.inputDrafts = {
    ...sessionState.inputDrafts,
    [type]: value
  };
  saveState();
}

export function setFeedScrollPosition(position: number): void {
  sessionState.feedScrollPosition = position;
  saveState();
}

export function setLastReadPostId(postId: string | null): void {
  sessionState.lastReadPostId = postId;
  saveState();
}

export function setActiveInput(input: InputType): void {
  sessionState.activeInput = input;
  saveState();
}

export function setCameraEnabled(enabled: boolean): void {
  sessionState.cameraEnabled = enabled;
  saveState();
}

export function setHandedness(handedness: 'left' | 'right'): void {
  sessionState.handedness = handedness;
  saveState();
}

// Clear specific draft
export function clearInputDraft(type: keyof InputDraftsState): void {
  const defaults: InputDraftsState = { text: '', link: '', person: null };
  sessionState.inputDrafts = {
    ...sessionState.inputDrafts,
    [type]: defaults[type]
  };
  saveState();
}

// Clear all drafts (after commit)
export function clearAllInputDrafts(): void {
  sessionState.inputDrafts = { text: '', link: '', person: null };
  saveState();
}

// Reset to defaults (nuclear option)
export function resetSessionState(): void {
  sessionState = { ...DEFAULT_STATE };
  saveState();
}

// Debug
export function debugSessionState(): void {
  console.log('Session State:', sessionState);
}

// Legacy compatibility - ForegroundLayer expects this
let loadedState = $state(false);
export function isSessionLoaded(): boolean {
  return loadedState;
}

export async function loadSessionState(): Promise<void> {
  if (loadedState) return;
  // State is already loaded from localStorage on module init
  loadedState = true;
}
