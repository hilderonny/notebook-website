var http = require("http");
var express = require("express");
var webpush = require("web-push");

var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('public'));

var keymap = {};

// Validate or create a public notification key
app.get('/api/getpublickey', function(request, response) {
  var requestedkey = request.query.key;
  if (keymap[requestedkey]) {
    response.send(requestedkey); // Already generated
  } else {
    // After server restart the generated keys are invalid so generate a new one
    response.send(generateVAPIDKeys());
  }
});

// Notify all subscribed endpoints
app.get('/api/notifyall', function(request, response) {
  Object.entries(keymap).forEach(function(publickey, privatekey) {
    console.log(publickey, privatekey);
  });
});


http.createServer(app).listen(port);


/********* FUNCTIONS ***************/

function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  keymap[vapidKeys.publicKey] = vapidKeys.privateKey;
  console.log(vapidKeys);
  return vapidKeys.publicKey;
}
