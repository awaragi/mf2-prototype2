/// <reference lib="webworker" />

import {Logger} from '../utils/logger.util.';
import {getCachedResponse, normalizeUrl} from '../utils/cache.util';
import {NO_CACHE_FLAG} from '../utils/constants.utils';

const logger = new Logger('[CACHE-SW]');

const sw = self as unknown as ServiceWorkerGlobalScope;

logger.log('🔧 Content Cache Service Worker: Registering events.');

/**
 * Determines if a pathname matches content criteria for database caching
 * @returns true if the path should be cached in the database
 * @param request
 * @param pathname
 */
function possibleCachedContent(request: Request, pathname: string): boolean {
  // Don't cache if the no-cache flag is set
  if (request.headers.has(NO_CACHE_FLAG)) {
    return false;
  }

  // Cache content from /api endpoints
  return pathname.startsWith('api/');
}

/**
 * Handles fetch events for content requests
 * @param event
 */
function handleFetchEvent(event: FetchEvent): void {
  // Check if this request matches content criteria
  const request = event.request;
  const pathname: string = normalizeUrl(new URL(request.url).pathname);

  logger.debug('Handling fetch event:', pathname);
  if (possibleCachedContent(request, pathname)) {
    logger.debug('Content request intercepted:', pathname);

    // respondWith must be called synchronously, so we pass it a Promise
    event.respondWith(
      (async () => {
        try {
          const cachedResponse = await getCachedResponse(pathname);

          if (cachedResponse) {
            logger.log('Cache hit:', pathname);
            return cachedResponse;
          }

          // Otherwise, fall back to network
          logger.debug('No cached response, fetching from network:', pathname);
          return fetch(request);
        } catch (error) {
          logger.error('Fetch handler failed:', {
            pathname: pathname,
            error: error instanceof Error ? error.message : String(error)
          });

          // Fall back to network on error
          return fetch(request);
        }
      })()
    );
  } else {
    logger.debug('Request not candidate for content caching:', pathname);
  }

  // Let the event bubble up to Angular's service worker
  // by not calling event.respondWith() here for non-matching requests
}

// Add custom fetch event monitoring
sw.addEventListener('fetch', handleFetchEvent);
logger.log('🔧 Content Cache Service Worker: Events registered.');

// Import Angular's service worker
logger.log('✅ Angular Service Worker: Registering...');
importScripts('./ngsw-worker.js');
logger.log('✅ Angular Service Worker: Registered.');
