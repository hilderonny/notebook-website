// Register background service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
    registration.onupdatefound = function() {
      console.log('Update found', registration);
    };
    console.log('Service Worker Registered');
  });
}

console.log('V 1');