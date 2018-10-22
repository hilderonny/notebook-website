// Distinguish cache in libraries which are huge but do not
// change often, and application files which are relatively
// small but change often.
// The version of the definitions will be used to determine whether
// the cache should be updated (name changed) or not
var cacheDefinitions = {
  libraries: {
    version: 4,
    files: [ '/material.css', '/material.js' ]
  },
  app: {
    version: 16,
    files: [
      '/',
      '/app.js',
      '/index.html',
      '/style.css'
      ]
  }
};


// Install service worker, is run at startup when
// the service worker file changed
self.addEventListener('install', function(evt) {
  evt.waitUntil((async function() {
    var libraryKey = 'libraries'  + cacheDefinitions.libraries.version;
    var appKey = 'app'  + cacheDefinitions.app.version;
    var cacheKeys = await caches.keys();
    console.log(cacheKeys);
    console.log('Changes to service worker detected! Preparing library ' + libraryKey + ' and app ' + appKey);
    var libraryCache = await caches.open(libraryKey);
    await libraryCache.addAll(cacheDefinitions.libraries.files);
    var appCache = await caches.open(appKey);
    await appCache.addAll(cacheDefinitions.app.files);
    self.skipWaiting(); // Force to run activate without waiting for old service worker to finish
  })());
});

// Remove old cache files when the version of the cache changed and so
// the cache needs to be updated
self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(function(cacheKeys) {
      return Promise.all(cacheKeys.map(function(key) {
        if (key !== 'libraries' + cacheDefinitions.libraries.version && key !== 'app' + cacheDefinitions.app.version) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// When a resource need to be fetched, check whether it is
// contained in the cache and return the cached version, otherwise
// get it from the network.
self.addEventListener('fetch', function(evt) {
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      return response || fetch(evt.request);
    })
  );
});