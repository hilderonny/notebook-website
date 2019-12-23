/* global LocalDb, Notebook */

window.addEventListener('load', async function() {
  
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