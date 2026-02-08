/**
 * Input Drafts Store
 * 
 * Persists input values for each input type (text, link, person)
 * even when not visible. This allows switching between CTAs
 * without losing work.
 */

// Draft storage for each input type
let textDraft = $state('');
let linkDraft = $state('');
let personDraft = $state<{ did: string; displayName: string; avatarUri?: string } | null>(null);

// Getters
export function getTextDraft(): string {
  return textDraft;
}

export function getLinkDraft(): string {
  return linkDraft;
}

export function getPersonDraft(): { did: string; displayName: string; avatarUri?: string } | null {
  return personDraft;
}

// Setters
export function setTextDraft(value: string): void {
  textDraft = value;
}

export function setLinkDraft(value: string): void {
  linkDraft = value;
}

export function setPersonDraft(value: { did: string; displayName: string; avatarUri?: string } | null): void {
  personDraft = value;
}

// Clear specific draft
export function clearTextDraft(): void {
  textDraft = '';
}

export function clearLinkDraft(): void {
  linkDraft = '';
}

export function clearPersonDraft(): void {
  personDraft = null;
}

// Check if any draft has content
export function hasAnyDraft(): boolean {
  return textDraft.length > 0 || linkDraft.length > 0 || personDraft !== null;
}

// Clear all drafts (after commit)
export function clearAllDrafts(): void {
  textDraft = '';
  linkDraft = '';
  personDraft = null;
}
