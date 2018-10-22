// Distinguish cache in libraries which are huge but do not
// change often, and application files which are relatively
// small but change often.
// The version of the definitions will be used to determine whether
// the cache should be updated (name changed) or not
var cacheDefinitions = {
  libraries: {
    version: 3,
    files: [ '/material.css', '/material.js' ]
  },
  app: {
    version: 13,
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
    var libraryVersion = cacheDefinitions.libraries.version;
    var appVersion = cacheDefinitions.app.version;
    console.log('Changes to service worker detected! Preparing library ' + libraryVersion + ' and app ' + appVersion);
    var libraryCache = await caches.open('libraries' + libraryVersion);
    await libraryCache.addAll(cacheDefinitions.libraries.files);
    var appCache = await caches.open('app' + appVersion);
    await appCache.addAll(cacheDefinitions.app.files);
  })());
});

// Remove old cache files when the version of the cache changed and so
// the cache needs to be updated
self.addEventListener('activate', function(evt) {
  console.log('activate');
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