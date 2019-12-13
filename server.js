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
    response.status(200).send(requestedkey); // Already generated
  } else {
    // After server restart the generated keys are invalid so generate a new one
    response.status(200).send(generateVAPIDKeys());
  }
});

app.get('/api/setendpoint', function(request, response) {
  var publickey = request.query.publickey;
  var endpoint = request.query.endpoint;
  console.log(publickey, endpoint);
  var entry = keymap[publickey];
  if (!entry) return response.status(404).send();
  entry.endpoint = endpoint;
  response.status(200).send();
});

// Notify all subscribed endpoints
app.get('/api/notifyall', function(request, response) {
  Object.entries(keymap).forEach(function(entry) {
    var publickey = entry[0];
    var endpoint = entry[1].endpoint;
    var privatekey = entry[1].preivatekey;
    console.log(publickey, privatekey, endpoint);
  });
});


http.createServer(app).listen(port);


/********* FUNCTIONS ***************/

function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  keymap[vapidKeys.publicKey] = { privatekey: vapidKeys.privateKey };
  console.log(vapidKeys);
  return vapidKeys.publicKey;
}
