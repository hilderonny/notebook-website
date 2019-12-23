/* global LocalDb */

const Notebook = (function() {
  
  return {
    init: function() {
      LocalDb.init({ version: 2, stores: ['books', 'pages'] });
    },
    createbook: async function() {
      var book = { _id: Date.now(), pageids: [], };
      var firstpage = { _id: Date.now(), bookid: book._id, };
      book.pageids.push(firstpage._id);
      book.currentpageid = firstpage._id;
      await LocalDb.save('books', book);
      await LocalDb.save('pages', firstpage);
      return book;
    },
    savebook: async function(book) {
      return LocalDb.save('books', book);
    },
    loadbooks: async function() {
      return LocalDb.list('books');
    },
    loadbook: async function(bookid) {
      return LocalDb.load('books', parseInt(bookid));
    },
    savepage: async function(page) {
      return LocalDb.save('pages', page);
    },
    loadpage: async function(pageid) {
      return LocalDb.load('pages', parseInt(pageid));
    },
  };

})();