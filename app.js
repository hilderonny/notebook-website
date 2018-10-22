const version = 11;
console.log("Hello PWA - Version " + version);
document.getElementById("version").innerHTML = version;

// Register background service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(function() { console.log('Service Worker Registered'); });
}