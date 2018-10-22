var cacheName = 'pwa-template-9';
var filesToCache = [];

// Installation
self.addEventListener('install', function(evt) {
  console.log('Installation');
  evt.waitUntil(caches.open(cacheName).then(function(cache) {
    console.log('Caching app shell');
    return cache.addAll(filesToCache);
  }));
});