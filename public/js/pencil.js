// Von https://github.com/quietshu/apple-pencil-safari-api-test/blob/gh-pages/index.html

function initpencil(canvas, config) {

  var context;
  var lineWidth = 0;
  var isDown = false;
  var context = canvas.getContext('2d');
  var points = [];
  
  var scalex = config.width / canvas.clientWidth;
  var scaley = config.height / canvas.clientHeight;
  
  function isPencil(e) {
    var usetouch = false;
    return e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined" && (usetouch || e.touches[0]["force"] > 0);
  }
  
  function handleDown(e) {
    var x, y;
    if (!isPencil(e)) return;
    x = e.touches[0].pageX * scalex;
    y = e.touches[0].pageY * scaley;
    isDown = true;
    lineWidth = config.pentype === 'eraser' ? config.pensize * 5 : config.pensize;
    context.globalCompositeOperation = config.pentype === 'eraser' ? 'destination-out' : 'source-over';
    context.lineWidth = lineWidth;
    context.strokeStyle = config.pentype === 'eraser' ? '#0008' : config.pencolor;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(x, y);
    points.push({
      x, y, lineWidth
    });
    document.querySelector('.card.page .buttonrow .savepage').removeAttribute('disabled');
  }
  
  function handleMove(e) {
    e.preventDefault();
    if (!isDown) return;
    var x, y;
    if (!isPencil(e)) return;
    x = e.touches[0].pageX * scalex;
    y = e.touches[0].pageY * scaley;
    points.push({
      x, y, lineWidth
    });
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (points.length >= 3) {
      var l = points.length - 1;
      var xc = (points[l].x + points[l - 1].x) / 2;
      var yc = (points[l].y + points[l - 1].y) / 2;
      context.lineWidth = points[l - 1].lineWidth;
      context.quadraticCurveTo(points[l - 1].x, points[l - 1].y, xc, yc);
      context.stroke();
      context.beginPath();
      context.moveTo(xc, yc);
    }
    canvas.hasChanged = true;
  }
  
  function handleUp(e) {
    var x, y;
    if (!isPencil(e)) return;
    x = e.touches[0].pageX * scalex;
    y = e.touches[0].pageY * scaley;
    isDown = false;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (points.length >= 3) {
      var l = points.length - 1;
      context.quadraticCurveTo(points[l].x, points[l].y, x, y);
      context.stroke();
    }
    points = [];
    canvas.hasChanged = true;
  }
  
  canvas.addEventListener("touchstart", handleDown);
  canvas.addEventListener("mousedown", handleDown);
  canvas.addEventListener("touchmove", handleMove);
  canvas.addEventListener("mousemove", handleMove);
  canvas.addEventListener("touchend", handleUp);
  canvas.addEventListener("touchleave", handleUp);
  canvas.addEventListener("mouseup", handleUp);
}
