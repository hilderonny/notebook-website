const LocalDb = (function() {
  
  var db;
  // Der Name der IndexedDB-Datenbank
  var dbName = 'notebook';
  // Wird die Versionsnummer hochgezählt, wird automatisch upgradeDb() aufgerufen. Sinnvoll bei Schemaänderung, was aber eigentlich nicht vorkommt
  var version = 1;
  var stores = [];
  
  function upgradeDb(db) {
    stores.forEach(function(store) {
      db.createObjectStore(store, { keyPath: '_id' });
    });
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
    
    /**
     * config = {
     *   stores: [] // Name of stores
     * }
     */
    init: function(config) {
      stores = config.stores;
    },
    
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
    
    load: function(collectionName, id) {
      return getDb().then(function(db) {
        return new Promise(function(resolve) {
          var request = db.transaction([collectionName], 'readwrite').objectStore(collectionName).get(id);
          request.onsuccess = function(event) {
            console.log(request.result);
            resolve(event);
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
