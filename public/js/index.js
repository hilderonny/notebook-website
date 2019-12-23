/* global LocalDb, Notebook */

window.addEventListener('load', async function() {
  
  registerServiceWorker();

  Notebook.init();
  
  var booklist = document.querySelector('.booklist');
  
  var books = await Notebook.loadbooks();
  books.forEach(function(book) {
    var button = document.createElement('button');
    button.innerHTML = book._id;
    button.addEventListener('click', function() {
      location.href = 'edit.html?bookid=' + book._id + '&pageid=' + book.currentpageid;
    });
    booklist.appendChild(button);
  });
  
});

async function createbook() {
  var book = await Notebook.createbook();
  location.href = 'edit.html?bookid=' + book._id + '&pageid=' + book.currentpageid;
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
