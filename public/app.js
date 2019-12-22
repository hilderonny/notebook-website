var canvas;

function initCanvas() {
  canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  console.log(canvas.width, canvas.height);
}

function registerServiceWorker() {
  // Service worker einbinden. Dieser muss im Stammverzeichnis der App in der Datei "serviceworker.js"
  // enthalten sein.
  if ('serviceWorker' in navigator) {
    var serviceWorkerFile = 'serviceworker.js';
    console.log('%c🧰 load: Registriere service worker aus Datei ' + serviceWorkerFile, 'color:yellow');
    navigator.serviceWorker.register(serviceWorkerFile).then(function(serviceworkerregistration) {
      console.log('Service Worker Registered!', serviceworkerregistration);
    }).catch(function(err) {
      console.log('Service Worker registration failed: ', err);
    });
  }
}

window.addEventListener('load', function () {
  registerServiceWorker();
  initCanvas();
});
