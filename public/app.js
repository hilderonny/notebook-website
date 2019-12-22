/* global initPencil, LocalDb */

/*
config = {
  scale: Canvas Skalierung, ab 2 macht das die Linien feiner.
  sensibility: Stärke, wie auf Druck reagiert wird. 0.5 ist ganz gut
  usetouch: true= Auch normale Touch-Eingaben werden behandelt
}
*/

function initCanvas(config) {
  var canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth * config.scale;
  canvas.height = window.innerHeight * config.scale;
  return canvas;
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

function save(canvas) {
  if (!canvas.hasChanged) return;
  var dataUrl = canvas.toDataURL('image/png');
  console.log(dataUrl);
  canvas.hasChanged = false;
}

window.addEventListener('load', async function () {
  registerServiceWorker();
  var config = {
    scale: 2,
    sensibility: .5,
    usetouch: true,
  };
  var canvas = initCanvas(config);
  initPencil(canvas, config);
  
  var pages = await LocalDb.list('pages');
  console.log(pages);
  
  setInterval(function() {
    save(canvas);
  }, 1000);
});
