/* global LocalDb */

window.addEventListener('load', async function() {
  
  var booklist = document.querySelector('.booklist');
  
  var books = await LocalDb.list('books');
  books.forEach(function(book) {
    var div = document.createElement('div');
    div.innerHTML = book._id;
    booklist.appendChild(div);
  });
  
});

async function createbook() {
  var book = { _id: Date.now() };
  await LocalDb.save('books', book);
  var page = { _id: Date.now(), bookid: book._id, };
  await LocalDb.save('pages', page);
  location.href = 'edit.html?bookid=' + book._id + '&pageid=' + page
}