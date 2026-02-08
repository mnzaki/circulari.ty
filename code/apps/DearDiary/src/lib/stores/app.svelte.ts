/**
 * App Initialization
 *
 * Handles database setup and initial data loading.
 * Call this early in the app lifecycle (e.g., in +layout.ts)
 */

import { createServices, type IPersistenceServices } from '@repo/persistence-tauri';
import { setPostService } from './posts.svelte';
import { setViewService } from './views.svelte';
import { setSessionService as setSessionForAccumulation } from './accumulatingPost.svelte';
import { setSessionService } from './session.svelte';
import { setPersonService } from './people.svelte';
import { setLinkPreviewService } from './linkPreview.svelte';
import { loadMockPosts } from './posts.svelte';

let initialized = $state(false);
let initializing = $state(false);
let error = $state<string | null>(null);
let services = $state<IPersistenceServices | null>(null);

/**
 * Check if running in Tauri environment
 */
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Initialize the app (database, services, initial data)
 */
export async function initializeApp(): Promise<void> {
  if (initialized || initializing) return;

  initializing = true;
  error = null;

  try {
    console.log('Initializing app...');

    // Check if running in Tauri
    if (!isTauri()) {
      throw new Error('DearDiary requires the Tauri runtime. Please run with `tauri dev` or use the built application.');
    }

    // Create persistence services (initializes drizzle proxy)
    services = createServices("deardiary.db");
    console.log('Persistence services created');

    // Wire up services to stores
    setPostService(services.post);
    setViewService(services.view);
    setSessionService(services.session);
    setSessionForAccumulation(services.session);
    setPersonService(services.person);
    setLinkPreviewService(services.linkPreview);

    // Check if we have any posts
    const postCount = await services.post.count();

    // If no posts, load mock data for demo
    if (postCount === 0) {
      console.log('No posts found, loading mock data...');
      await loadMockPosts();
    } else {
      console.log(`Found ${postCount} existing posts`);
    }

    // Ensure The Feed™ view exists
    await services.view.getFeed();

    initialized = true;
    console.log('App initialization complete');
  } catch (err) {
    console.error('App initialization failed:', err);
    error = err instanceof Error ? err.message : String(err);
    // Don't throw - let the UI show the error state
  } finally {
    initializing = false;
  }
}

/**
 * Get the persistence services
 */
export function getServices(): IPersistenceServices {
  if (!services) {
    throw new Error('Services not initialized. Call initializeApp() first.');
  }
  return services;
}

/**
 * Check if app is initialized
 */
export function isAppInitialized(): boolean {
  return initialized;
}

/**
 * Check if app is currently initializing
 */
export function isAppInitializing(): boolean {
  return initializing;
}

/**
 * Get initialization error
 */
export function getInitError(): string | null {
  return error;
}

/**
 * Reset initialization (for testing)
 */
export function resetInit(): void {
  initialized = false;
  initializing = false;
  error = null;
  services = null;
}
