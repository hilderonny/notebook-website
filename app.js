// Register background service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(function(registration) {
    registration.onupdatefound = function() {
      //console.log('Update found', registration);
      var installingWorker = registration.installing;
      installingWorker.onstatechange = function() {
        //console.log('State changed', installingWorker);
        if (installingWorker.state === 'activated') {
          //console.log('Reloading...');
          location.reload(); // Reload the page to show changed cache files
        }
      };
    };
    //console.log('Service Worker Registered');
  });
}
