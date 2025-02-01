var express = require('express');
var app = express();
var stringReplace = require('string-replace-middleware');

var KC_URL = process.env.KC_URL || "http://localhost:8080";
var SERVICE_URL = process.env.SERVICE_URL || "http://localhost:3000/secured";
var REALM_NAME = process.env.REALM_NAME || "myrealm";
var CLIENT_ID = process.env.CLIENT_ID || "myclient";

app.use(stringReplace({
   'SERVICE_URL': SERVICE_URL,
   'KC_URL': KC_URL,
   'REALM_NAME': REALM_NAME,
   'CLIENT_ID': CLIENT_ID
}));

// Serve static files from the current directory
app.use(express.static('.'));

// Endpoint for root ('/')
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint for client.js
app.get('/client.js', function(req, res) {
    res.sendFile(__dirname + '/client.js');
});

const parts = KC_URL.split(/[:/]+/);

// Start the server
app.listen(8000, function() {
    console.log('Server running at http://' + parts[1] + ':8000');
    console.log('Keycloak URL (KC_URL):',  KC_URL);
    console.log('Service URL (SERVICE_URL):', SERVICE_URL);
});
