/* global LocalDb */

async function createbook() {
  var book = { _id: Date.now(), pageids: [], };
  var firstpage = { _id: Date.now(), bookid: book._id, };
  book.pageids.push(firstpage._id);
  book.currentpage = firstpage._id;
  await LocalDb.save('books', book);
  await LocalDb.save('pages', firstpage);
  return book;
}

async function savebook(book) {
  
}

async function loadbooks() {
  
}

async function loadbook(bookid) {
  
}

async function savepage(page) {
  
}

async function loadpage(pageid) {
  
}
