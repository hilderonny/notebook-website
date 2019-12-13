var http = require("http");
var express = require("express");
var webpush = require("web-push");
var bodyparser = require('body-parser');

var port = process.env.PORT || 8080;

var app = express();
app.use(express.static('public'));
app.use(bodyparser.json());

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

app.post('/api/setendpoint', function(request, response) {
  var data = request.body;
  console.log(data);
  var entry = keymap[data.publickey];
  if (!entry) return response.status(404).send();
  entry.subscription = data.subscription;
  response.status(200).send();
});

// Notify all subscribed endpoints
app.post('/api/notifyall', function(request, response) {
  var payload = request.body;
  notifyallafter5seconds(payload);
  response.status(200).send();
});


http.createServer(app).listen(port);


/********* FUNCTIONS ***************/

function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  keymap[vapidKeys.publicKey] = { privatekey: vapidKeys.privateKey };
  console.log(vapidKeys);
  return vapidKeys.publicKey;
}

function notifyallafter5seconds(payload) {
  console.log('Waiting 5 seconds to notify all ...');
  setTimeout(function() {
    notifyall(payload);
  }, 5000);
}

function notifyall(payload) {
  console.log('Notifying all ...');
  Object.entries(keymap).forEach(function(entry) {
    notify(entry[0], entry[1].privatekey, entry[1].subscription, payload);
  });
}

function notify(publickey, privatekey, subscription, payload) {
  console.log(publickey, privatekey, subscription, payload);
  var options = {
    vapidDetails: {
      subject: 'mailto:example_email@example.com',
      publicKey: publickey,
      privateKey: privatekey
    },
    TTL: 60
  };
  webpush.sendNotification(
    subscription,
    JSON.stringify(payload),
    options
  );
}
