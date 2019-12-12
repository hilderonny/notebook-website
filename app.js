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