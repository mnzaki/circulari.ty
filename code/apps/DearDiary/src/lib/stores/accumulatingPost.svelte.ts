/**
 * Accumulating Post Store
 * 
 * Manages the staging area for post creation.
 * Local state only - drafts handled at component level.
 */

import { addPost, loadPosts } from './posts.svelte';
import type { AccumulableBit, AccumulatingPost, Post } from '@o19/foundframe-front';
import { createEmptyAccumulation } from '@o19/foundframe-front';

// Reactive state
let accumulationState = $state<AccumulatingPost>(createEmptyAccumulation());

// Derived state
export const isAccumulating = () => accumulationState.bits.length > 0;
export const bitCount = () => accumulationState.bits.length;

export function getAccumulation(): AccumulatingPost {
  return accumulationState;
}

/**
 * Add a bit to the accumulation
 */
export async function addBit(bit: AccumulableBit): Promise<void> {
  accumulationState.bits = [...accumulationState.bits, bit];
}

/**
 * Remove a bit by index
 */
export async function removeBit(index: number): Promise<void> {
  accumulationState.bits = accumulationState.bits.filter((_, i) => i !== index);
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
  accumulationState = createEmptyAccumulation();
}

/**
 * Commit the accumulation to a Post
 */
export async function commit(): Promise<Post | null> {
  if (accumulationState.bits.length === 0) return null;
  
  // Convert draft links to full links with id and createdAt
  const links = accumulationState.draftLinks.map(draft => ({
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date()
  }));
  
  const post = await addPost(accumulationState.bits, links);
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
