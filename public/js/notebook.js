/* global LocalDb */

const Notebook = (function() {

  var _userid;

  function _generateid() {
    return _userid + '.' + Date.now().toString();
  }
  
  return {
    init: function(userid) {
      _userid = userid.toString();
      LocalDb.init({ stores: ['book', 'page'] });
    },
    addbook: async function() {
      var bookid = _generateid();
      var pageid = _generateid();
      var book = { id: bookid, user: _userid, title: '', currentpage: pageid, lastmodified: Date.now() };
      var firstpage = { id: pageid, user: _userid, book: bookid, data: null, lastmodified: Date.now() };
      await LocalDb.save('book', book);
      await LocalDb.save('page', firstpage);
      return book;
    },
    addpage: async function(book) {
      var newpage = { id: _generateid(), user: _userid, book: book.id, data: null, lastmodified: Date.now() };
      await LocalDb.save('page', newpage);
      return newpage;
    },
    loadbooks: async function() {
      return LocalDb.list('book');
    },
    loadbook: async function(bookid) {
      return LocalDb.load('book', bookid);
    },
    loadpage: async function(pageid) {
      return LocalDb.load('page', pageid);
    },
    loadpages: async function() {
      return LocalDb.list('page');
    },
    savebook: async function(book) {
      return LocalDb.save('book', book);
    },
    savepage: async function(page) {
      return LocalDb.save('page', page);
    },
  };

})();