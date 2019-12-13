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
  notifyallafter5seconds();
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

function notifyallafter5seconds() {
  console.log('Waiting 5 seconds to notify all ...');
  setTimeout(notifyall, 500);
}

function notifyall() {
  console.log('Notifying all ...');
  Object.entries(keymap).forEach(function(entry) {
    notify(entry[0], entry[1].privatekey, entry[1].endpoint);
  });
}

function notify(publickey, privatekey, endpoint) {
  console.log(publickey, privatekey, endpoint);
  var pushSubscription = {"endpoint":"https://fcm.googleapis.com/fcm/send/c0NI73v1E0Y:APA91bEN7z2weTCpJmcS-MFyfbgjtmlAWuV5YaaNw625_Rq2-f0ZrVLdRPXKGm7B3uwfygicoCeEoWQxCKIxlL3RWG2xkHs6C8-H_cxq-4Z-isAiZ3ixo84-2HeXB9eUvkfNO_t1jd5s","keys":{"p256dh":"BHxSHtYS0q3i0Tb3Ni6chC132ZDPd5uI4r-exy1KsevRqHJvOM5hNX-M83zgYjp-1kdirHv0Elhjw6Hivw1Be5M=","auth":"4a3vf9MjR9CtPSHLHcsLzQ=="}};

var vapidPublicKey = 'BAdXhdGDgXJeJadxabiFhmlTyF17HrCsfyIj3XEhg1j-RmT2wXU3lHiBqPSKSotvtfejZlAaPywJ9E-7AxXQBj4
';
var vapidPrivateKey = 'VCgMIYe2BnuNA4iCfR94hA6pLPT3u3ES1n1xOTrmyLw
';

var payload = 'Here is a payload!';

var options = {
  vapidDetails: {
    subject: 'mailto:example_email@example.com',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey
  },
  TTL: 60
};

webPush.sendNotification(
  pushSubscription,
  payload,
  options
);
}