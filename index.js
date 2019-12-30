var express = require('express');
var db = require('@levelupsoftware/db');
var http = require('http');
var auth = require('@levelupsoftware/auth');
var notebook = require('@levelupsoftware/notebook');

// Prepare the server
var app = express();
app.use('/', express.static('./public'));

// Connect to database and then start the server
db.connect(process.env.DBHOST, process.env.DB, process.env.DBUSER, process.env.DBPASSWORD).then(async function() {

    // Module initialisieren
    await auth.init(app, db, process.env.TOKENSECRET || 'mytokensecret');
    await notebook.init(app, db, auth);

    http.createServer(app).listen(process.env.PORT, function() {
        console.log('App listening on port ' + process.env.PORT);
    });
});
