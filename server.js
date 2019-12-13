var http = require("http");
var express = require("express");
var webpush = require("web-push");

var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('public'));

app.get('/api/getpublickey', function(request, response) {
  var keys = generateVAPIDKeys();
  response.send(keys.publicKey);
});

http.createServer(app).listen(port);


/********* FUNCTIONS ***************/

function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();

  return {
    publicKey: vapidKeys.publicKey,
    privateKey: vapidKeys.privateKey,
  };
}
