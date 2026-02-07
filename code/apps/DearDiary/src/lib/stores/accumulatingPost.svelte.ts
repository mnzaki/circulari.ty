import { createEmptyAccumulation, commitAccumulation } from '$lib/types/post';
import type { AccumulatingPost, Post } from '$lib/types/post';
import type { AccumulableBit, XanaduLink } from '$lib/types/xanadu';

/**
 * The Accumulating Post Store
 * 
 * Manages the ephemeral composition that lives in the CCCB.
 * This is the staging area where bits gather before commitment.
 */

// Reactive state using Svelte 5 runes
let accumulation = $state<AccumulatingPost>(createEmptyAccumulation());
let isAccumulating = $derived(accumulation.bits.length > 0);

// Read-only access
export function getAccumulation(): AccumulatingPost {
  return accumulation;
}

export function hasAccumulation(): boolean {
  return isAccumulating;
}

export function getBitCount(): number {
  return accumulation.bits.length;
}

// Actions

/**
 * Add a bit to the accumulation
 */
export function addBit(bit: AccumulableBit): void {
  accumulation.bits = [...accumulation.bits, bit];
}

/**
 * Remove a bit by index
 */
export function removeBit(index: number): void {
  accumulation.bits = accumulation.bits.filter((_, i) => i !== index);
}

/**
 * Reorder bits (for future drag-to-reorder UI)
 */
export function reorderBits(fromIndex: number, toIndex: number): void {
  const bits = [...accumulation.bits];
  const [moved] = bits.splice(fromIndex, 1);
  bits.splice(toIndex, 0, moved);
  accumulation.bits = bits;
}

/**
 * Add a draft link
 */
export function addDraftLink(link: Omit<XanaduLink, 'id' | 'createdAt'>): void {
  accumulation.draftLinks = [...accumulation.draftLinks, link];
}

/**
 * Clear the accumulation (discard)
 */
export function clearAccumulation(): void {
  accumulation = createEmptyAccumulation();
}

/**
 * Commit the accumulation to a Post
 * This transforms the staging area into a permanent feed item
 */
export function commit(): Post | null {
  if (accumulation.bits.length === 0) return null;
  
  const id = generatePostId();
  const post = commitAccumulation(accumulation, id);
  
  // Clear the staging area
  clearAccumulation();
  
  return post;
}

// ID generation (future: content hash)
function generatePostId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Debug helper
export function debugAccumulation(): void {
  console.log('Accumulating:', {
    bitCount: accumulation.bits.length,
    bits: accumulation.bits.map(b => b.type),
    draftLinks: accumulation.draftLinks.length
  });
}
