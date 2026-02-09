/**
 * Persistence Tauri
 *
 * Proxies from drizzle to `tauri-plugin-sql` via `src-tauri/src/drizzle_proxy.rs`
 */

import { invoke } from '@tauri-apps/api/core';
import { createServices as createDrizzleServices, type FetchUrlPreviewFn } from '@repo/persistence-drizzle';
import { createDrizzleProxy } from './drizzleProxy.js';

// Fetcher that uses the Tauri command - now supports both HTML and Media previews
const urlPreviewFetcher: FetchUrlPreviewFn = async (url: string) => {
  const result = await invoke<{
    Html?: {
      title?: string;
      description?: string;
      image_url?: string;
      images?: string[];
      site_name?: string;
    };
    Media?: {
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
    Unknown?: {};
  }>('url_preview_json', { url });
  
  // Handle HTML preview
  if (result.Html) {
    return {
      type: 'html' as const,
      title: result.Html.title,
      description: result.Html.description,
      image_url: result.Html.image_url,
      images: result.Html.images,
      site_name: result.Html.site_name
    };
  }
  
  // Handle Media preview
  if (result.Media) {
    return {
      type: 'media' as const,
      url: result.Media.url,
      media_type: result.Media.media_type,
      width: result.Media.width,
      height: result.Media.height,
      duration: result.Media.duration,
      file_size: result.Media.file_size,
      thumbnail_path: result.Media.thumbnail_path,
      metadata: result.Media.metadata
    };
  }
  
  // Unknown type
  return { type: 'unknown' as const };
};

export function createServices(dbName = "database.db") {
  // @ts-ignore
  return createDrizzleServices(createDrizzleProxy(dbName), {
    urlPreviewFetcher
  });
}

export type IPersistenceServices = ReturnType<typeof createServices>;
export type { FetchUrlPreviewFn } from '@repo/persistence-drizzle';
