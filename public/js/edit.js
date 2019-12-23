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
  var currentindex = book.pages.indexOf(book.currentpageid);
  if (currentindex >= book.pages.length) {
    
  }
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
  console.log(book, page);
  
  var config = {
    width: 1080,
    height: 1920,
    sensibility: .5,
    usetouch: true,
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
  
  setInterval(function() {
    save(canvas);
  }, 1000);
});
