const LocalDb = (function() {
  
  var db;
  // Der Name der IndexedDB-Datenbank
  var dbName = 'notebook';
  // Wird die Versionsnummer hochgezählt, wird automatisch upgradeDb() aufgerufen. Sinnvoll bei Schemaänderung, was aber eigentlich nicht vorkommt
  var version = 1;
  
  function upgradeDb(db) {
    db.createObjectStore('books', { keyPath: '_id' });
    db.createObjectStore('pages', { keyPath: '_id' });
  }
  
  // Liefert Referenz auf die Datenbank und erstellt sie bei Bedarf
  function getDb() {
    return new Promise(function(resolve, reject) {
      if (db) return resolve(db);
      const request = window.indexedDB.open(dbName, version);
      request.onerror = function() {
        console.log('ERROR', request);
        db = null;
        reject(request);
      };
      request.onsuccess = function() {
        db = request.result;
        resolve(db);
      };
      request.onupgradeneeded = function(event) { 
        upgradeDb(event.target.result);
      };
    });
  }
  
  // Legt LocalDb als Singleton-Klasse im globalen Kontext an.
  return {
    
    list: function(collectionName) {
      return getDb().then(function(db) {
        return new Promise(function(resolve) {
          var request = db.transaction([collectionName], 'readwrite').objectStore(collectionName).openCursor();
          var elements = [];
          request.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
              elements.push(cursor.value);
              cursor.continue();
            } else {
              resolve(elements);
            }
          };
        });
      });
    },
    
    save: function(collectionName, element) {
      return getDb().then(function(db) {
        return new Promise(function(resolve, reject) {
          const request = db.transaction([collectionName], 'readwrite').objectStore(collectionName).put(element);
          request.onerror = function() {
            reject(request);
          };
          request.onsuccess = function() {
            resolve(request.result);
          };
        });
      });
    },
    
  }
  
}());
console.log(LocalDb);