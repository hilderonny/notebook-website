var cacheName = 'pwa-template-9';
var filesToCache = [];

// Installation
self.addEventListener('install', function(evt) {
  console.log('Install ' + cacheName);
  evt.waitUntil(caches.open(cacheName).then(function(cache) {
    console.log('Caching app shell');
    return cache.addAll(filesToCache);
  }));
});

// Activation
self.addEventListener('activate', function(evt) {
  console.log('Activate ' + cacheName);
    evt.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});