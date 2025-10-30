import { contentCache } from './idb';

/**
 * Normalizes a URL for consistent cache storage and retrieval
 * Removes leading slashes to ensure consistent database keys
 * @param url - The URL to normalize
 * @returns The normalized URL string
 */
export function normalizeUrl(url: string): string {
  // Remove leading slash for consistent database key
  return url.startsWith('/') ? url.slice(1) : url;
}

/**
 * Caches a resource by URL, fetching it and storing in IndexedDB
 * @param url - The URL to fetch and cache
 * @returns Promise that resolves when caching is complete
 * @throws Error if fetch fails or caching fails
 */
export async function cacheResource(url: string): Promise<void> {
  const response = await fetch(url, { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const blob = await response.blob();
  const type = response.headers.get('Content-Type') || blob.type || 'application/octet-stream';
  const etag = response.headers.get('ETag') || undefined;

  await contentCache.putAsset({
    url: normalizeUrl(url),
    blob,
    type,
    size: blob.size,
    etag
  });
}

/**
 * Retrieves a cached resource and returns it as a Response object
 * @param url - The URL to retrieve from cache
 * @returns Response object if found in cache, null otherwise
 */
export async function getCachedResponse(url: string): Promise<Response | null> {
  const normalizedUrl = normalizeUrl(url);
  const cached = await contentCache.getAsset(normalizedUrl);

  if (!cached) {
    return null;
  }

  return new Response(cached.blob, {
    headers: {
      'Content-Type': cached.type || 'application/octet-stream',
      'X-Cache-Status': 'HIT'
    }
  });
}

/**
 * Clears all cached assets from IndexedDB
 * @returns Promise that resolves when all assets are cleared
 */
export async function clearAllCache(): Promise<void> {
  await contentCache.clearAllAssets();
}

