/* global initPencil, Notebook */

/*
config = {
  width: Breite des Bildes, normalerweise 1080  - hochkant
  height: Höhe des Bildes, normalerweise 1920  - hochkant
  sensibility: Stärke, wie auf Druck reagiert wird. 0.5 ist ganz gut
  usetouch: true= Auch normale Touch-Eingaben werden behandelt
}
*/

var book, page, canvas;

function initCanvas(config) {
  canvas = document.querySelector("canvas");
  canvas.width = config.width;
  canvas.height = config.height;
}

async function save() {
  if (!canvas.hasChanged) return;
  var dataUrl = canvas.toDataURL('image/png');
  console.log(dataUrl);
  page.dataUrl = dataUrl;
  page.blob = Uint8Array.from(atob(dataUrl.substring(22)), c => c.charCodeAt(0));
  Notebook.savepage(page);
  canvas.hasChanged = false;
}

async function nextpage() {
  var currentindex = book.pageids.indexOf(book.currentpageid);
  if (currentindex >= book.pageids.length - 1) {
    await Notebook.addpage(book);
  }
  var nextpageid = book.pageids[currentindex + 1];
  location.href = 'edit.html?bookid=' + book._id + '&pageid=' + nextpageid;
}

async function previouspage() {
  var currentindex = book.pageids.indexOf(book.currentpageid);
  if (currentindex < 1) return;
  var previouspageid = book.pageids[currentindex - 1];
  location.href = 'edit.html?bookid=' + book._id + '&pageid=' + previouspageid;
}

window.addEventListener('load', async function () {
  
  var params = location.search.substring(1).split('&').map(function(p) { return p.split('='); }).reduce(function(val, cur) { val[cur[0]] = cur[1]; return val; }, {});
  console.log(params);
  if (!params.bookid || !params.pageid) {
    location.href = "/";
    return;
  };
  
  book = await Notebook.loadbook(params.bookid);
  page = await Notebook.loadpage(params.pageid);
  book.currentpageid = page._id;
  await Notebook.savebook(book);
  
  var config = {
    width: 2100, // A4
    height: 2970,
    sensibility: 1,
    usetouch: false,
  };
  initCanvas(config);
  initPencil(canvas, config);
  
  if (page.dataUrl) {
    var image = new Image();
    image.onload = function() {
      canvas.getContext('2d').drawImage(image, 0, 0);
    };
    image.src = page.dataUrl;
  }
  
  document.querySelector('.pages').innerHTML = (book.pageids.indexOf(book.currentpageid) + 1) + " / " + book.pageids.length;
  
  setInterval(function() {
    save();
  }, 1000);
  
});

window.addEventListener("orientationchange", function() {
  location.reload(); // Damit Breite und Höhe wieder synchron sind
});
