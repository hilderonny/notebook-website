// Von https://github.com/quietshu/apple-pencil-safari-api-test/blob/gh-pages/index.html

function initPencil(canvas, config) {

  var context;
  var lineWidth = 0;
  var isDown = false;
  var context = canvas.getContext('2d');
  var points = [];
  
  var scalex = canvas.clientWidth / config.width;
  var scaley = canvas.clientHeight / config.height;
  console.log(canvas, config, scalex, scaley);
  
  function isPencil(e) {
    return e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined" && (config.usetouch || e.touches[0]["force"] > 0);
  }
  
  function handleDown(e) {
    var pressure = 0.1;
    var x, y;
    if (!isPencil(e)) return;
    pressure = e.touches[0]["force"] * config.sensibility;
    x = e.touches[0].pageX * config.scale;
    y = e.touches[0].pageY * config.scale;
    isDown = true;
    context.lineWidth = lineWidth;
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(x, y);
    points.push({
      x, y, lineWidth
    });
    canvas.hasChanged = true;
  }
  
  function handleMove(e) {
    if (!isDown) return;
    var pressure = 0.1;
    var x, y;
    if (!isPencil(e)) return;
    pressure = e.touches[0]["force"] * config.sensibility;
    x = e.touches[0].pageX * config.scale;
    y = e.touches[0].pageY * config.scale;
    lineWidth = (Math.log(pressure + 1) * 40 * 0.4 + lineWidth * 0.6);
    points.push({
      x, y, lineWidth
    });
    context.strokeStyle = 'black';
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
    e.preventDefault();
  }
  
  function handleUp(e) {
    var pressure = 0.1;
    var x, y;
    if (!isPencil(e)) return;
    pressure = e.touches[0]["force"] * config.sensibility;
    x = e.touches[0].pageX * config.scale;
    y = e.touches[0].pageY * config.scale;
    isDown = false;
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    if (points.length >= 3) {
      var l = points.length - 1;
      context.quadraticCurveTo(points[l].x, points[l].y, x, y);
      context.stroke();
    }
    points = [];
    lineWidth = 0;
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
