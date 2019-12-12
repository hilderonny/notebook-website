/* global firebase */
window.addEventListener('load', function () {
  var firebaseConfig = {
    apiKey: "AIzaSyBc4CRAMGrF_w6ZG33f5qrzChSgMOW8Oas",
    authDomain: "liaga-e0b43.firebaseapp.com",
    databaseURL: "https://liaga-e0b43.firebaseio.com",
    projectId: "liaga-e0b43",
    storageBucket: "liaga-e0b43.appspot.com",
    messagingSenderId: "129945696898",
    appId: "1:129945696898:web:0509bda5712cd46faf929b",
    measurementId: "G-TCYF2GFX07"
  };
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  
  Notification.requestPermission(function(status) {
      console.log('Notification permission status:', status);
  });
  
  // Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
  // enthalten sein.
  if ('serviceWorker' in navigator) {
    var serviceWorkerFile = 'service-worker.js';
    console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
    navigator.serviceWorker.register(serviceWorkerFile).then(function(reg) {
      console.log('Service Worker Registered!', reg);
      reg.pushManager.getSubscription().then(function(sub) {
        if (sub === null) {
          // Update UI to ask user to register for Push
          console.log('Not subscribed to push service!');
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: new Uint8Array("AAAAHkFd-oI:APA91bGFcb3QSqvYVlkhk_ljW6ZCEqes251k9OtNkGqpoN1T1RVPVF11YmGKDHvcUpbwhqEa4SEXppwdpPQ8PNt1RGr_wKYze0_-1hBeHNY1zhH1V-ztxoFqKC6wIxjiOSKPz9cKcpcF")
          }).then(function(sub) {
            console.log('Subscription: ', sub);
          }).catch(function(e) {
            if (Notification.permission === 'denied') {
              console.warn('Permission for notifications was denied');
            } else {
              console.error('Unable to subscribe to push', e);
            }
          });
        } else {
          // We have a subscription, update the database
          console.log('Subscription object: ', sub);
        }
      });
    }).catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
  }

});

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}