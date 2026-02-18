/**
 * URL Preview Store
 *
 * Manages URL preview fetching and caching using the PreviewService.
 */

import type { PreviewMetadata, PreviewPort } from '@o19/foundframe-front';

// Service reference
let previewService: PreviewPort | null = null;

// static state
let previews = new Map<string, PreviewMetadata>();
let loading = new Set<string>();
let errors = new Map<string, string>();

/**
 * Set the preview service (called during app initialization)
 */
export function setPreviewService(service: PreviewPort): void {
  previewService = service;
}

/**
 * Alias for backwards compatibility
 * @deprecated Use setPreviewService instead
 */
export function setLinkPreviewService(service: PreviewPort): void {
  setPreviewService(service);
}

/**
 * Get a preview for a URL.
 * Returns cached if available, otherwise fetches.
 * Multiple concurrent requests for the same URL share the same promise.
 */
export async function getPreview(url: string): Promise<PreviewMetadata | null> {
  if (!previewService) {
    console.warn('Preview service not initialized');
    return null;
  }

  if (!url.trim()) return null;

  // Check if already in reactive state
  const cached = previews.get(url);
  if (cached) {
    return cached;
  }

  // Mark as loading
  loading.add(url);
  errors.delete(url);

  try {
    const preview = await previewService.getForURL(url);

    previews.set(url, preview);

    return preview;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preview';
    errors.set(url, errorMessage);
    return null;
  } finally {
    loading.delete(url);
  }
}

/**
 * Get cached preview without fetching
 */
export async function getCachedPreview(url: string): Promise<PreviewMetadata | null> {
  const cached = previews.get(url);
  if (cached) return cached;

  if (!previewService) return null;

  const preview = await previewService.getCached(url);
  if (preview) {
    previews.set(url, preview);
  }
  return preview;
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
  previews.clear();
  errors.clear();
}

/**
 * Get all cached preview URLs
 */
export function getCachedUrls(): string[] {
  return [...previews.keys()];
}
