/// <reference lib="webworker" />

import {Logger} from '../utils/logger.util.';
import {getCachedResponse} from '../utils/cache.util';

const logger = new Logger('[CACHE-SW]');

const sw = self as unknown as ServiceWorkerGlobalScope;

logger.log('🔧 Content Cache Service Worker: Registering events.');

/**
 * Determines if a pathname matches content criteria for database caching
 * @param pathname - The URL pathname to check
 * @returns true if the path should be cached in the database
 */
function shouldCacheContent(pathname: string): boolean {
  // Cache content from /api endpoints
  return pathname.startsWith('/api/');
}

/**
 * Handles fetch events for cacheable content
 * @param event - The fetch event
 * @param url - Parsed URL object
 * @returns Response from database cache, or null if not found
 */
async function handleFetchEvent(event: FetchEvent, url: URL): Promise<Response | null> {
  logger.debug('Checking cache for:', url.pathname);

  // Try to get from database using the utility function
  const cachedResponse = await getCachedResponse(url.pathname);
  if (cachedResponse) {
    logger.log('Cache hit:', url.pathname);
    return cachedResponse;
  }

  logger.debug('Cache miss, not handling:', url.pathname);
  return null;
}

// Add custom fetch event monitoring
sw.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);

  // Check if this request matches content criteria
  if (shouldCacheContent(url.pathname)) {
    logger.debug('Content request intercepted:', url.pathname);

    let cachedResponse = null;
    try {
      cachedResponse = await handleFetchEvent(event, url);
    } catch (error) {
      logger.error('Fetch handler failed:', {
        pathname: url.pathname,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Only intercept if we have a cached response
    if (cachedResponse) {
      event.respondWith(cachedResponse);
    }
  }

  // Let the event bubble up to Angular's service worker
  // by not calling event.respondWith() here
});

logger.log('🔧 Content Cache Service Worker: Events registered.');

// Import Angular's service worker
logger.log('✅ Angular Service Worker: Registering...');
importScripts('./ngsw-worker.js');
logger.log('✅ Angular Service Worker: Registered.');
