/// <reference lib="webworker" />

console.log('🔧 Custom Service Worker: Script loading...');

// Add custom fetch event monitoring
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special logging for /api requests
  if (url.pathname.startsWith('/api')) {
    console.log('🌐 API Request Intercepted:', {
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
          console.log('🌐 API Response received, processing...');
          // Clone the response so we can read it
          const clonedResponse = response.clone();
          
          try {
            const data = await clonedResponse.json();
            console.log('🌐 API Response Data:', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              data: data,
              timestamp: new Date().toISOString()
            });
          } catch (e) {
            console.log('🌐 API Response (non-JSON):', {
              pathname: url.pathname,
              status: response.status,
              statusText: response.statusText,
              timestamp: new Date().toISOString()
            });
          }
          
          console.log('🌐 Returning response to client');
          return response;
        })
        .catch((error) => {
          console.error('🌐 API Request Failed:', {
            pathname: url.pathname,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          throw error;
        })
    );
    return;
  }
  
  console.log('Custom SW: Fetch event intercepted', {
    url: event.request.url,
    method: event.request.method,
    mode: event.request.mode,
    credentials: event.request.credentials
  });



  // Let the event bubble up to Angular's service worker
  // by not calling event.respondWith() here
});

console.log('🔧 Custom Service Worker: Fetch listener registered');

// Import Angular's service worker
console.log('🔧 Custom Service Worker: Importing Angular NGSW...');
importScripts('./ngsw-worker.js');


console.log('✅ Custom service worker loaded and extended Angular NGSW');
