/**
 * Accumulating Post Store (Database-Backed)
 * 
 * Manages the staging area for post creation.
 * Drafts are persisted to database for continuity.
 */

import { addPost, loadPosts } from './posts.svelte';
import type { AccumulableBit, AccumulatingPost, Post, ISessionService } from '@repo/persistence';

// Reactive state
let accumulationState = $state<AccumulatingPost>({
  bits: [],
  draftLinks: []
});

// Service reference
let service: ISessionService | null = null;

// Derived state
export const isAccumulating = () => accumulationState.bits.length > 0;
export const bitCount = () => accumulationState.bits.length;

export function getAccumulation(): AccumulatingPost {
  return accumulationState;
}

/**
 * Set the session service (called during app initialization)
 */
export function setSessionService(svc: ISessionService): void {
  service = svc;
}

/**
 * Load drafts from database on init
 */
export async function loadDrafts(): Promise<void> {
  if (!service) return;
  
  const textDraft = await service.getTextDraft();
  const linkDraft = await service.getLinkDraft();
  const personDraft = await service.getPersonDraft();
  
  const bits: AccumulableBit[] = [];
  
  if (textDraft) {
    bits.push({ type: 'text', content: textDraft });
  }
  if (linkDraft) {
    bits.push({ type: 'link', url: linkDraft, preview: { title: 'Draft Link' } });
  }
  if (personDraft) {
    bits.push({ 
      type: 'person', 
      did: personDraft.did, 
      displayName: personDraft.displayName,
      avatarUri: personDraft.avatarUri 
    });
  }
  
  accumulationState = { bits, draftLinks: [] };
}

/**
 * Add a bit to the accumulation
 */
export async function addBit(bit: AccumulableBit): Promise<void> {
  accumulationState.bits = [...accumulationState.bits, bit];
  
  if (!service) return;
  
  switch (bit.type) {
    case 'text':
      await service.setTextDraft(bit.content);
      break;
    case 'link':
      await service.setLinkDraft(bit.url);
      break;
    case 'person':
      await service.setPersonDraft({
        did: bit.did,
        displayName: bit.displayName,
        avatarUri: bit.avatarUri
      });
      break;
  }
}

/**
 * Remove a bit by index
 */
export async function removeBit(index: number): Promise<void> {
  const removed = accumulationState.bits[index];
  accumulationState.bits = accumulationState.bits.filter((_, i) => i !== index);
  
  if (!removed || !service) return;
  
  switch (removed.type) {
    case 'text':
      await service.setTextDraft('');
      break;
    case 'link':
      await service.setLinkDraft('');
      break;
    case 'person':
      await service.setPersonDraft(null);
      break;
  }
}

/**
 * Reorder bits
 */
export function reorderBits(fromIndex: number, toIndex: number): void {
  const bits = [...accumulationState.bits];
  const [moved] = bits.splice(fromIndex, 1);
  bits.splice(toIndex, 0, moved);
  accumulationState.bits = bits;
}

/**
 * Clear the accumulation
 */
export async function clearAccumulation(): Promise<void> {
  accumulationState = { bits: [], draftLinks: [] };
  if (service) {
    await service.clearAllDrafts();
  }
}

/**
 * Commit the accumulation to a Post
 */
export async function commit(): Promise<Post | null> {
  if (accumulationState.bits.length === 0) return null;
  
  const post = await addPost(accumulationState);
  await clearAccumulation();
  return post;
}

// Debug
export function debugAccumulation(): void {
  console.log('Accumulating:', {
    bitCount: accumulationState.bits.length,
    bits: accumulationState.bits.map(b => b.type)
  });
}
