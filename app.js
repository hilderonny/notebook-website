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
  
  subscribeToPushNotification();
});

// Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
// enthalten sein.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        var serviceWorkerFile = 'service-worker.js';
        console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
        navigator.serviceWorker.register(serviceWorkerFile);
    });
}

navigator.serviceWorker.ready
.then(function(registration) {
    if (!registration.pushManager) {
        alert(
            'This browser does not ' +
            'support push notification.');
        return false;
    }
    //---to subscribe push notification using
    // pushmanager---
    registration.pushManager.subscribe(
        //---always show notification when received---
        { userVisibleOnly: true }
    )
    .then(function (subscription) {
        console.log('Push notification subscribed.');
        console.log(subscription);
    })
    .catch(function (error) {
        console.error(
            'Push notification subscription error: ',
            error);
    });
});

navigator.serviceWorker.ready
.then(function (registration) {
    registration.pushManager.getSubscription()
    .then(function (subscription) {
      console.log(subscription);
    })
    .catch(function (error) {
        console.error(
            'Error occurred enabling push ',
            error);
    });
});

