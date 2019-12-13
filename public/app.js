/* global firebase */

var serviceworkerregistration;

function triggernotification() {
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
          
        });
      }
      return Promise.resolve(publickey);
    }).then(function(publickey) {
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
      
    });
  });
}


window.addEventListener('load', function () {
  /*
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
  //firebase.analytics();
  
  Notification.requestPermission(function(status) {
      console.log('Notification permission status:', status);
  });
  */
  
  // Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
  // enthalten sein.
  if ('serviceWorker' in navigator) {
    var serviceWorkerFile = 'serviceworker.js';
    console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
    navigator.serviceWorker.register(serviceWorkerFile).then(function(reg) {
      console.log('Service Worker Registered!', reg);
      serviceworkerregistration = reg;
      document.getElementById("triggerbutton").removeAttribute("disabled");
      /*
      reg.pushManager.getSubscription().then(function(sub) {
        if (sub === null) {
          // Update UI to ask user to register for Push
          console.log('Not subscribed to push service!');
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BGMHfmImXAVpZuZdYShHqh3e4IU_B5YyM5ZLYM4lIA9m2lCNarr7-hwSILkbJmfJbB3WB5Onk-Lizq-TD_trp_A")
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
          console.log('Subscription object: ', JSON.parse(JSON.stringify(sub)));
        }
      });
    */
    }).catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
  }

});

/*
// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
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
*/