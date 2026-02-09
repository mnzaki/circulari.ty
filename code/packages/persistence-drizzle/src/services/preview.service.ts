/**
 * Preview Service
 * 
 * Fetches and caches URL previews (both HTML webpages and media files).
 * Deduplicates concurrent requests for the same URL.
 */

import { eq, lt } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { CachedPreview, IPreviewService } from '@repo/persistence';
import { previews } from '../schema.js';

// HTML preview result from Tauri
export type HtmlPreviewResult = {
  type: 'html';
  title?: string;
  description?: string;
  image_url?: string;
  images?: string[];
  site_name?: string;
};

// Media preview result from Tauri
export type MediaPreviewResult = {
  type: 'media';
  url: string;
  media_type: string;
  width?: number;
  height?: number;
  duration?: number;
  file_size?: number;
  thumbnail_path?: string;
  metadata: {
    title?: string;
    description?: string;
    created_at?: string;
    camera_make?: string;
    camera_model?: string;
    latitude?: number;
    longitude?: number;
  };
};

export type UnknownPreviewResult = {
  type: 'unknown';
};

export type PreviewResult = HtmlPreviewResult | MediaPreviewResult | UnknownPreviewResult;

// Function type for fetching preview from external source (Tauri)
export type FetchUrlPreviewFn = (url: string) => Promise<PreviewResult>;

export class PreviewService implements IPreviewService {
  // In-flight requests - shared promises for concurrent deduplication
  private inFlight = new Map<string, Promise<CachedPreview>>();
  
  constructor(
    private db: BaseSQLiteDatabase<any, any>,
    private fetcher?: FetchUrlPreviewFn
  ) {}

  async getForURL(url: string): Promise<CachedPreview> {
    // Normalize URL
    const normalizedUrl = this.normalizeURL(url);
    
    // Check for existing in-flight request (deduplication)
    const existing = this.inFlight.get(normalizedUrl);
    if (existing) {
      return existing;
    }
    
    // Create the request promise
    const promise = this.fetchPreview(normalizedUrl);
    
    // Store in-flight
    this.inFlight.set(normalizedUrl, promise);
    
    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up in-flight
      this.inFlight.delete(normalizedUrl);
    }
  }

  private async fetchPreview(url: string): Promise<CachedPreview> {
    // First check cache
    const cached = await this.getCached(url);
    if (cached) {
      // Check if cache is still fresh (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      const age = Date.now() - cached.fetchedAt.getTime();
      if (age < maxAge && !cached.error) {
        return cached;
      }
    }
    
    // Fetch fresh preview via provided fetcher
    if (!this.fetcher) {
      throw new Error('No fetcher provided for preview');
    }
    
    try {
      const result = await this.fetcher(url);
      
      const cachedPreview: CachedPreview = {
        url,
        previewType: result.type,
        // HTML fields
        title: result.type === 'html' ? result.title : undefined,
        description: result.type === 'html' ? result.description : 
                     result.type === 'media' ? result.metadata?.description : undefined,
        imageUrl: result.type === 'html' ? result.image_url : 
                  result.type === 'media' ? result.thumbnail_path : undefined,
        images: result.type === 'html' ? result.images : undefined,
        siteName: result.type === 'html' ? result.site_name : undefined,
        // Media fields
        mediaType: result.type === 'media' ? result.media_type : undefined,
        width: result.type === 'media' ? result.width : undefined,
        height: result.type === 'media' ? result.height : undefined,
        duration: result.type === 'media' ? result.duration : undefined,
        fileSize: result.type === 'media' ? result.file_size : undefined,
        thumbnailPath: result.type === 'media' ? result.thumbnail_path : undefined,
        mediaUrl: result.type === 'media' ? result.url : undefined,
        // Common
        fetchedAt: new Date()
      };
      
      // Store in cache
      await this.store(cachedPreview);
      
      return cachedPreview;
    } catch (error) {
      // Store error in cache to avoid retrying failed URLs too often
      const errorPreview: CachedPreview = {
        url,
        previewType: 'unknown',
        fetchedAt: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
      
      await this.store(errorPreview);
      return errorPreview;
    }
  }

  async getCached(url: string): Promise<CachedPreview | null> {
    const normalizedUrl = this.normalizeURL(url);
    
    const result = await this.db
      .select()
      .from(previews)
      .where(eq(previews.url, normalizedUrl))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      url: row.url,
      previewType: row.previewType as 'html' | 'media' | 'unknown',
      title: row.title ?? undefined,
      description: row.description ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      images: row.images as string[] | undefined,
      siteName: row.siteName ?? undefined,
      mediaType: row.mediaType ?? undefined,
      width: row.width ?? undefined,
      height: row.height ?? undefined,
      duration: row.duration ?? undefined,
      fileSize: row.fileSize ?? undefined,
      thumbnailPath: row.thumbnailPath ?? undefined,
      mediaUrl: row.mediaUrl ?? undefined,
      fetchedAt: row.fetchedAt,
      error: row.error ?? undefined
    };
  }

  async store(preview: CachedPreview): Promise<void> {
    await this.db.insert(previews)
      .values({
        url: preview.url,
        previewType: preview.previewType,
        title: preview.title,
        description: preview.description,
        imageUrl: preview.imageUrl,
        images: preview.images,
        siteName: preview.siteName,
        mediaType: preview.mediaType,
        width: preview.width,
        height: preview.height,
        duration: preview.duration,
        fileSize: preview.fileSize,
        thumbnailPath: preview.thumbnailPath,
        mediaUrl: preview.mediaUrl,
        fetchedAt: preview.fetchedAt,
        error: preview.error
      })
      .onConflictDoUpdate({
        target: previews.url,
        set: {
          previewType: preview.previewType,
          title: preview.title,
          description: preview.description,
          imageUrl: preview.imageUrl,
          images: preview.images,
          siteName: preview.siteName,
          mediaType: preview.mediaType,
          width: preview.width,
          height: preview.height,
          duration: preview.duration,
          fileSize: preview.fileSize,
          thumbnailPath: preview.thumbnailPath,
          mediaUrl: preview.mediaUrl,
          fetchedAt: preview.fetchedAt,
          error: preview.error
        }
      });
  }

  async deleteOlderThan(maxAgeMs: number): Promise<void> {
    const cutoff = new Date(Date.now() - maxAgeMs);
    await this.db.delete(previews).where(lt(previews.fetchedAt, cutoff));
  }

  private normalizeURL(url: string): string {
    // Simple normalization - trim and lowercase
    return url.trim().toLowerCase();
  }
}
