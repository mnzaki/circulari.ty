/**
 * Persistence Tauri
 * 
 * Tauri-specific persistence layer using @tauri-apps/plugin-sql.
 * This is the production-ready adapter for cross-platform SQLite.
 */

import {
  PostService,
  ViewService,
  SessionService,
  PersonService,
  type IPostService,
  type IViewService,
  type ISessionService,
  type IPersonService
} from '@repo/persistence';
import { TauriAdapter } from './adapter.js';

// Singleton adapter instance
let adapter: TauriAdapter | null = null;

// Service singletons
let postService: IPostService | null = null;
let viewService: IViewService | null = null;
let sessionService: ISessionService | null = null;
let personService: IPersonService | null = null;

/**
 * Initialize the Tauri persistence layer.
 * Must be called before using any services.
 */
export async function initPersistence(): Promise<void> {
  if (adapter) return;
  
  adapter = new TauriAdapter();
  await adapter.init();
  
  // Initialize services with the adapter
  postService = new PostService(adapter);
  viewService = new ViewService(adapter);
  sessionService = new SessionService(adapter);
  personService = new PersonService(adapter);
}

/**
 * Get the PostService instance.
 * Throws if initPersistence() hasn't been called.
 */
export function getPostService(): IPostService {
  if (!postService) {
    throw new Error('Persistence not initialized. Call initPersistence() first.');
  }
  return postService;
}

/**
 * Get the ViewService instance.
 * Throws if initPersistence() hasn't been called.
 */
export function getViewService(): IViewService {
  if (!viewService) {
    throw new Error('Persistence not initialized. Call initPersistence() first.');
  }
  return viewService;
}

/**
 * Get the SessionService instance.
 * Throws if initPersistence() hasn't been called.
 */
export function getSessionService(): ISessionService {
  if (!sessionService) {
    throw new Error('Persistence not initialized. Call initPersistence() first.');
  }
  return sessionService;
}

/**
 * Get the PersonService instance.
 * Throws if initPersistence() hasn't been called.
 */
export function getPersonService(): IPersonService {
  if (!personService) {
    throw new Error('Persistence not initialized. Call initPersistence() first.');
  }
  return personService;
}

// Re-export the adapter for advanced use cases
export { TauriAdapter } from './adapter.js';

// Re-export core types for convenience
export type {
  Post,
  AccumulatingPost,
  View,
  ViewFilters,
  InputType,
  AccumulableBit,
  XanaduLink,
  UAddress,
  Person
} from '@repo/persistence';
