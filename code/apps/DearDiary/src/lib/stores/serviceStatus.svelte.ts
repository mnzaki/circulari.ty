/**
 * Service Status Store
 * 
 * Tracks the connection status of the FoundframeRadicle background service.
 * Used to show fatal errors when the service fails to connect.
 * 
 * NOTE: Events may be missed if they fire before UI mounts, so we also
 * support polling via checkServiceStatus().
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

// Reactive state
let isConnected = $state(false);
let fatalError = $state<{
  error: string;
  message: string;
  details: string;
  recoverable: boolean;
} | null>(null);
let hasAttemptedConnection = $state(false);

// Getters
export function getServiceConnected(): boolean {
  return isConnected;
}

export function getServiceFatalError(): typeof fatalError {
  return fatalError;
}

export function getHasAttemptedConnection(): boolean {
  return hasAttemptedConnection;
}

/**
 * Initialize service status monitoring
 * Call this early in app lifecycle
 */
export async function initServiceStatusMonitoring(): Promise<() => void> {
  console.log('[ServiceStatus] Initializing monitoring...');
  
  const unlistenFatal = await listen('foundframe:fatal-error', (event: { payload: typeof fatalError }) => {
    console.error('[ServiceStatus] Fatal error received:', event.payload);
    fatalError = event.payload;
    isConnected = false;
    hasAttemptedConnection = true;
  });

  const unlistenDisconnect = await listen('foundframe:service-disconnected', () => {
    console.error('[ServiceStatus] Service disconnected');
    isConnected = false;
  });

  const unlistenConnected = await listen('foundframe:service-connected', () => {
    console.log('[ServiceStatus] Service connected successfully');
    isConnected = true;
    fatalError = null; // Clear any previous error
    hasAttemptedConnection = true;
  });

  // Mark that we've attempted connection (will be set to true when platform initializes)
  hasAttemptedConnection = true;

  return () => {
    unlistenFatal();
    unlistenDisconnect();
    unlistenConnected();
  };
}

/**
 * Mark service as connected
 * Called by the platform when connection succeeds
 */
export function markServiceConnected(): void {
  isConnected = true;
  fatalError = null;
}

/**
 * Set fatal error manually
 * Used when we detect connection failure through other means
 */
export function setServiceFatalError(error: typeof fatalError): void {
  fatalError = error;
  isConnected = false;
}

/**
 * Clear error (e.g., after restart)
 */
export function clearServiceError(): void {
  fatalError = null;
}

/**
 * Check service status by calling backend
 * Use this on mount to catch errors that fired before UI was ready
 */
export async function checkServiceStatus(): Promise<{ connected: boolean; error?: string }> {
  try {
    const result = await invoke<{ connected: boolean; error?: string }>('plugin:o19-foundframe-tauri|check_service_status');
    console.log('[ServiceStatus] checkServiceStatus result:', result);
    
    if (!result.connected && result.error) {
      fatalError = {
        error: "Service not connected",
        message: result.error,
        details: "",
        recoverable: false
      };
    } else if (result.connected) {
      isConnected = true;
      fatalError = null;
    }
    
    return result;
  } catch (e) {
    console.error('[ServiceStatus] checkServiceStatus failed:', e);
    // If the command itself fails, that's also a fatal error
    fatalError = {
      error: "Service check failed",
      message: "Could not communicate with backend",
      details: String(e),
      recoverable: false
    };
    return { connected: false, error: String(e) };
  }
}

/**
 * Try to start the service explicitly
 * On Android, this restarts the service if it's not running
 */
export async function startService(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ServiceStatus] Attempting to start service...');
    const result = await invoke<{ success: boolean; error?: string }>('plugin:o19-foundframe-tauri|start_service');
    console.log('[ServiceStatus] startService result:', result);
    
    if (result.success) {
      // Check if service is now connected
      await checkServiceStatus();
    }
    
    return result;
  } catch (e) {
    console.error('[ServiceStatus] startService failed:', e);
    return { success: false, error: String(e) };
  }
}
