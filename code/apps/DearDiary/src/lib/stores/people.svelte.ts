/**
 * People Store
 * 
 * Manages people/mentions state and provides search functionality.
 */

import type { Person, PersonPort } from '@o19/foundframe-front';

// Service reference
let personService: PersonPort | null = null;

// Reactive state
let searchResults = $state<Person[]>([]);
let linkedPeople = $state<Set<string>>(new Set());
let isSearching = $state(false);
let searchError = $state<string | null>(null);

/**
 * Set the person service (called during app initialization)
 */
export function setPersonService(service: PersonPort): void {
  personService = service;
}

/**
 * Search for people by display name
 */
export async function searchPeople(query: string, limit: number = 50): Promise<Person[]> {
  if (!personService) {
    console.warn('Person service not initialized');
    return [];
  }
  
  if (!query.trim()) {
    searchResults = [];
    return [];
  }
  
  isSearching = true;
  searchError = null;
  
  try {
    const results = await personService.search(query.trim(), limit);
    searchResults = results;
    return results;
  } catch (err) {
    console.error('Failed to search people:', err);
    searchError = err instanceof Error ? err.message : 'Search failed';
    return [];
  } finally {
    isSearching = false;
  }
}

/**
 * Get a person by their DID
 */
export async function getPersonByDid(did: string): Promise<Person | null> {
  if (!personService) {
    console.warn('Person service not initialized');
    return null;
  }
  
  try {
    return await personService.getByDid(did);
  } catch (err) {
    console.error('Failed to get person:', err);
    return null;
  }
}

/**
 * Link a person to the current post (mark as selected)
 */
export function linkPerson(did: string): void {
  linkedPeople = new Set([...linkedPeople, did]);
}

/**
 * Unlink a person from the current post
 */
export function unlinkPerson(did: string): void {
  const newSet = new Set(linkedPeople);
  newSet.delete(did);
  linkedPeople = newSet;
}

/**
 * Check if a person is linked
 */
export function isPersonLinked(did: string): boolean {
  return linkedPeople.has(did);
}

/**
 * Get all linked person DIDs
 */
export function getLinkedPeople(): string[] {
  return [...linkedPeople];
}

/**
 * Clear all linked people
 */
export function clearLinkedPeople(): void {
  linkedPeople = new Set();
}

/**
 * Create a new person (for adding new contacts)
 */
export async function createPerson(person: { displayName: string; did?: string; handle?: string; avatarMediaId?: number; metadata?: Record<string, unknown> }): Promise<Person | null> {
  if (!personService) {
    console.warn('Person service not initialized');
    return null;
  }
  
  try {
    return await personService.create(person);
  } catch (err) {
    console.error('Failed to create person:', err);
    return null;
  }
}

// Reactive getters
export function getSearchResults(): Person[] {
  return searchResults;
}

export function getIsSearching(): boolean {
  return isSearching;
}

export function getSearchError(): string | null {
  return searchError;
}
