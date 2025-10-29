/// <reference lib="webworker" />

import Dexie from "dexie";

const sw = self as unknown as ServiceWorkerGlobalScope;

console.log('🔧 Custom Service Worker: Script loading...');

// Add custom fetch event monitoring
sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special logging for /api requests
  if (url.pathname.startsWith('/api')) {
    console.log('API Request Intercepted:', {
      url: event.request.url,
      pathname: url.pathname,
      method: event.request.method,
      mode: event.request.mode,
      credentials: event.request.credentials,
      timestamp: new Date().toISOString()
    });

    const db = new Dexie('TestDB').version(1).stores({ items: '++id,name' });
    console.log('Dexie DB Initialized in SW:', db.stores);

    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          console.log('API Response received, processing...');
          // Clone the response so we can read it
          const clonedResponse = response.clone();
          
          try {
            const data = await clonedResponse.json();
            console.log('API Response Data:', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              data: data,
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.log('API Response (non-JSON):', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              timestamp: new Date().toISOString()
            });
          }
          
          console.log('Returning response to client');
          return response;
        })
        .catch((error) => {
          console.error('API Request Failed:', {
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

console.log('🔧 Custom Service Worker: Fetch listener registered');

// Import Angular's service worker
importScripts('./ngsw-worker.js');
console.log('✅ Angular NGSW registered successfully');
