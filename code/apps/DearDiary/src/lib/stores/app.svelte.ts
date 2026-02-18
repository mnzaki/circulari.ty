/**
 * App Initialization
 *
 * Handles database setup and initial data loading.
 * Call this early in the app lifecycle (e.g., in +layout.ts)
 */

import { invoke } from '@tauri-apps/api/core';
import { attachConsole } from '@tauri-apps/plugin-log';
import { createServices } from '@o19/foundframe-tauri';
import { setPostService } from './posts.svelte';
import { setViewService } from './views.svelte';
import { setPersonService } from './people.svelte';
import { setPreviewService } from './linkPreview.svelte';
import { setDeviceService } from './devices.svelte';
import { loadMockPosts } from './posts.svelte';
import { platform } from '@tauri-apps/plugin-os';
import { initServiceStatusMonitoring, getServiceFatalError } from './serviceStatus.svelte';

// send log messages from Rust to the webview console
attachConsole().then((_detach) => {});

let initialized = $state(false);
let initializing = $state(false);
let error = $state<string | null>(null);
let services = $state<ReturnType<typeof createServices> | null>(null);

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
export function isAndroid(): boolean {
  // Check if we're running in Tauri on Android
  return platform() == 'android';
}

/**
 * Wait for Tauri backend to be ready by pinging it
 * Retries every 100ms for up to 10 seconds
 */
async function waitForBackend(maxWaitMs = 10000, intervalMs = 100): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  console.log('Waiting for backend to be ready...');

  while (Date.now() - startTime < maxWaitMs) {
    try {
      // FIXME move the ping command to foundframe-front
      const response = await invoke<string>('plugin:o19-foundframe-tauri|ping');
      if (response === 'pong') {
        console.log('Backend is ready');
        return;
      }
    } catch (err) {
      // Backend not ready yet, store last error for debugging
      lastError = err instanceof Error ? err : new Error(String(err));
      // Only log periodically to avoid console spam
      if (Math.floor((Date.now() - startTime) / 1000) % 2 === 0) {
        console.log(
          `Backend not ready yet, retrying... (${Math.round((Date.now() - startTime) / 100) / 10}s)`
        );
      }
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Backend failed to respond within ${maxWaitMs}ms. Last error: ${lastError?.message || 'Unknown'}`
  );
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
      throw new Error(
        'DearDiary requires the Tauri runtime. Please run with `tauri dev` or use the built application.'
      );
    }

    // Initialize service status monitoring early (before services are created)
    // This ensures we catch fatal errors from service connection failures
    await initServiceStatusMonitoring();

    // Wait for backend to be ready before proceeding
    await waitForBackend();

    // Create persistence services
    services = createServices();
    console.log('Persistence services created');
    
    // Check if service connection failed
    const serviceError = getServiceFatalError();
    if (serviceError) {
      console.error('Service connection failed:', serviceError);
      throw new Error(serviceError.message);
    }

    // Wire up services to stores
    setPostService(services.post);
    setViewService(services.view);
    setPersonService(services.person);
    setPreviewService(services.preview);
    setDeviceService(services.device);

    // Check if we have any posts
    const postCount = await services.post.count();

    // If no posts, load mock data for demo
    if (postCount === 0) {
      console.log('No posts found, loading mock data...');
      await loadMockPosts();
    } else {
      console.log(`Found ${postCount} existing posts`);
    }

    // Ensure TheStream™ view exists
    await services.view.getTheStream();

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
export function getServices(): ReturnType<typeof createServices> {
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
