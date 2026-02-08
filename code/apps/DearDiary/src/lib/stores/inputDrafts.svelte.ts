/**
 * Input Drafts Store
 * 
 * Persists input values for each input type (text, link, person)
 * even when not visible. This allows switching between CTAs
 * without losing work.
 * 
 * This store now syncs with sessionState for persistence across
 * app restarts.
 */

import { 
  getInputDrafts as getPersistedDrafts,
  setInputDraft as setPersistedDraft,
  clearInputDraft as clearPersistedDraft,
  clearAllInputDrafts as clearAllPersistedDrafts
} from './sessionState.svelte';

// Getters - read from session state
export function getTextDraft(): string {
  return getPersistedDrafts().text;
}

export function getLinkDraft(): string {
  return getPersistedDrafts().link;
}

export function getPersonDraft(): { did: string; displayName: string; avatarUri?: string } | null {
  return getPersistedDrafts().person;
}

// Setters - write to session state (auto-persisted)
export function setTextDraft(value: string): void {
  setPersistedDraft('text', value);
}

export function setLinkDraft(value: string): void {
  setPersistedDraft('link', value);
}

export function setPersonDraft(value: { did: string; displayName: string; avatarUri?: string } | null): void {
  setPersistedDraft('person', value);
}

// Clear specific draft
export function clearTextDraft(): void {
  clearPersistedDraft('text');
}

export function clearLinkDraft(): void {
  clearPersistedDraft('link');
}

export function clearPersonDraft(): void {
  clearPersistedDraft('person');
}

// Check if any draft has content
export function hasAnyDraft(): boolean {
  const drafts = getPersistedDrafts();
  return drafts.text.length > 0 || drafts.link.length > 0 || drafts.person !== null;
}

// Clear all drafts (after commit)
export function clearAllDrafts(): void {
  clearAllPersistedDrafts();
}
