/// <reference lib="webworker" />

import {Logger} from '../utils/logger';

const logger = new Logger('[CACHE-SW]');

const sw = self as unknown as ServiceWorkerGlobalScope;

logger.log('🔧 Content Cache Service Worker: Registering events.');

// Add custom fetch event monitoring
sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Special logging for /api requests
  if (url.pathname.startsWith('/api')) {
    logger.debug('API Request Intercepted:', {
      url: event.request.url,
      pathname: url.pathname,
      method: event.request.method,
      mode: event.request.mode,
      credentials: event.request.credentials,
      timestamp: new Date().toISOString()
    });

    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          logger.debug('API Response received, processing...');
          // Clone the response so we can read it
          const clonedResponse = response.clone();

          try {
            const data = await clonedResponse.json();
            logger.debug('API Response Data:', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              data: data,
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            logger.debug('API Response (non-JSON):', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              timestamp: new Date().toISOString()
            });
          }

          logger.debug('Returning response to client');
          return response;
        })
        .catch((error) => {
          logger.error('API Request Failed:', {
            pathname: url.pathname,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          throw error;
        })
    );
    return;
  }

  // Let the event bubble up to Angular's service worker
  // by not calling event.respondWith() here
});

logger.log('🔧 Content Cache Service Worker: Events registered.');

// Import Angular's service worker
logger.log('✅ Angular Service Worker: Registering...');
importScripts('./ngsw-worker.js');
logger.log('✅ Angular Service Worker: Registered.');
