/**
 * URL Preview Store
 * 
 * Manages URL preview fetching and caching for both HTML and media.
 * Uses the PreviewService from persistence.
 */

import type { CachedPreview, IPreviewService } from '@repo/persistence';

// Service reference
let previewService: IPreviewService | null = null;

// Reactive state
let previews = $state<Map<string, CachedPreview>>(new Map());
let loading = $state<Set<string>>(new Set());
let errors = $state<Map<string, string>>(new Map());

/**
 * Set the preview service (called during app initialization)
 */
export function setPreviewService(service: IPreviewService): void {
  previewService = service;
}

/**
 * Alias for backwards compatibility
 * @deprecated Use setPreviewService instead
 */
export function setLinkPreviewService(service: IPreviewService): void {
  setPreviewService(service);
}

/**
 * Get a preview for a URL.
 * Returns cached if available, otherwise fetches.
 * Multiple concurrent requests for the same URL share the same promise.
 */
export async function getPreview(url: string): Promise<CachedPreview | null> {
  if (!previewService) {
    console.warn('Preview service not initialized');
    return null;
  }
  
  if (!url.trim()) return null;
  
  // Check if already in reactive state
  const cached = previews.get(url);
  if (cached && !cached.error) {
    return cached;
  }
  
  // Mark as loading
  loading = new Set([...loading, url]);
  errors = new Map([...errors].filter(([k]) => k !== url));
  
  try {
    const preview = await previewService.getForURL(url);
    
    // Update reactive state
    previews = new Map([...previews, [url, preview]]);
    
    if (preview.error) {
      errors = new Map([...errors, [url, preview.error]]);
    }
    
    return preview;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
    errors = new Map([...errors, [url, errorMessage]]);
    return null;
  } finally {
    const newLoading = new Set(loading);
    newLoading.delete(url);
    loading = newLoading;
  }
}

/**
 * Get cached preview without fetching
 */
export function getCachedPreview(url: string): CachedPreview | null {
  return previews.get(url) ?? null;
}

/**
 * Check if a URL is currently loading
 */
export function isLoading(url: string): boolean {
  return loading.has(url);
}

/**
 * Get error for a URL if any
 */
export function getError(url: string): string | null {
  return errors.get(url) ?? null;
}

/**
 * Clear all cached previews
 */
export function clearPreviews(): void {
  previews = new Map();
  errors = new Map();
}

/**
 * Get all cached preview URLs
 */
export function getCachedUrls(): string[] {
  return [...previews.keys()];
}
