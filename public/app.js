/* global firebase */

function triggernotification() {
  var payload = {
    title: 'Notification title',
    content: 'Notification content',
    icon: 'https://cdn.glitch.com/cb41b966-e11c-4f74-ba16-5b0d7bd50b67%2Ficon-192.png'
  };
  post('/api/notifyall', payload);
}

function post(url, data) {
  return fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

window.addEventListener('load', function () {
  // Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
  // enthalten sein.
  if ('serviceWorker' in navigator) {
    var serviceWorkerFile = 'serviceworker.js';
    console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
    navigator.serviceWorker.register(serviceWorkerFile).then(function(serviceworkerregistration) {
      console.log('Service Worker Registered!', serviceworkerregistration);
      // Request notification permission
      Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
        if (status !== 'granted') return alert("Notification permission was denied. Cannot continue until the permission is granted.");
        // First check if the key is already generated for the device
        var publickey = localStorage.getItem('notificationkey');
        fetch('/api/getpublickey?key=' + encodeURI(publickey)).then(function(response) {
          return response.text();
        }).then(function(publickeyfromserver) {
          console.log("Public keys:", publickey, publickeyfromserver);
          if (publickey !== publickeyfromserver) {
            // Try to unregister the previous registration when the keys differ
            return serviceworkerregistration.pushManager.getSubscription().then(function(subscription) {
              console.log('Existing subscription:', subscription);
              return subscription.unsubscribe();
            }).then(function() {
              console.log('Successfully unsubscribed');
              return Promise.resolve(publickeyfromserver);
            }).catch(function(err) {
              console.log(err);
              // Irnore unsubscribe errors
              return Promise.resolve(publickeyfromserver);
            });
          }
          return Promise.resolve(publickey);
        }).then(function(newpublickey) {
          publickey = newpublickey;
          // Save the key for future use
          localStorage.setItem('notificationkey', publickey);
          return serviceworkerregistration.pushManager.subscribe(
            {
              userVisibleOnly: true,
              applicationServerKey: publickey
            }
          );
        }).then(function(subscription) {
          console.log("Subscription:", subscription);
          // Register the endpoint on the server
          return post('/api/setendpoint', { publickey: publickey, subscription: subscription });
        }).then(function(result) {
          // Done, from here on the notification works
          document.getElementById("triggerbutton").removeAttribute("disabled");
        });
      });
    }).catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
  }

});
