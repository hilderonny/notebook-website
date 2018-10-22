// Register background service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(function() { console.log('Service Worker Registered'); });
}

console.log('V 1');