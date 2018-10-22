var cacheName = 'pwa-template-14';
var filesToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css'
];

// Install service worker
self.addEventListener('install', function(evt) {
  console.log('Install ' + cacheName);
  evt.waitUntil(caches.open(cacheName).then(function(cache) {
    console.log('Caching app shell');
    return cache.addAll(filesToCache);
  }));
});

// Update cache
self.addEventListener('activate', function(evt) {
  console.log('Activate ' + cacheName);
    evt.waitUntil(
    caches.keys().then(function(keyList) {
      console.log(keyList);
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

// Fetch from cache or network
self.addEventListener('fetch', function(evt) {
  console.log('Fetch ' + evt.request.url);
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});