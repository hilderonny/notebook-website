/* global initPencil, LocalDb */

/*
config = {
  scale: Canvas Skalierung, ab 2 macht das die Linien feiner.
  sensibility: Stärke, wie auf Druck reagiert wird. 0.5 ist ganz gut
  usetouch: true= Auch normale Touch-Eingaben werden behandelt
}
*/

function initCanvas(config) {
  var canvas = document.querySelector("canvas");
  canvas.width = window.innerWidth * config.scale;
  canvas.height = window.innerHeight * config.scale;
  return canvas;
}


async function save(canvas) {
  if (!canvas.hasChanged) return;
  var dataUrl = canvas.toDataURL('image/png');
  console.log(dataUrl);
  var element = {
    _id: 1,
    data: dataUrl,
    blob: Uint8Array.from(atob(dataUrl.substring(22)), c => c.charCodeAt(0)),
  }
  var result = await LocalDb.save('pages', element);
  console.log(result);
  canvas.hasChanged = false;
}

window.addEventListener('load', async function () {
  
  var params = location.search.substring(1).split('&').map(function(p) { return p.split('='); }).reduce(function(val, cur) { val[cur[0]] = cur[1]; return val; }, {});
  console.log(params);
  if (!params.bookid || !params.pageid) {
    location.href = "/";
    return;
  };
  
  var config = {
    scale: 2,
    sensibility: .5,
    usetouch: true,
  };
  var canvas = initCanvas(config);
  initPencil(canvas, config);
  
  var pages = await LocalDb.list('pages');
  console.log(pages);
  
  setInterval(function() {
    save(canvas);
  }, 1000);
});
