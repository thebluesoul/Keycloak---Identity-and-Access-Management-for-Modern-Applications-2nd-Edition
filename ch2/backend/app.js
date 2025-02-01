var stringReplace = require('string-replace-middleware');
var express = require('express');
var session = require('express-session');
var Keycloak = require('keycloak-connect');
var cors = require('cors');

var dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

var app = express();

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

app.use(cors());

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// Keycloak 설정 주입 (keycloak.json 내용 통합)
var keycloakConfig = {
  "realm": REALM_NAME || "myrealm",
  "bearer-only": true,
  "auth-server-url": KC_URL || "http://localhost:8080",
  "resource": CLIENT_ID || "myclient",
  "verify-token-audience": false
};

// Keycloak 인스턴스 생성
var keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(keycloak.middleware());

app.get('/secured', keycloak.protect([REALM_NAME + ':myrole']), function (req, res) {
  res.setHeader('content-type', 'text/plain');
  res.send('Secret message!');
});

app.get('/public', function (req, res) {
  res.setHeader('content-type', 'text/plain');
  res.send('Public message!');
});

app.get('/', function (req, res) {
  res.send('<html><body><ul><li><a href="/public">Public endpoint</a></li><li><a href="/secured">Secured endpoint</a></li></ul></body></html>');
});

app.listen(3000, function () {
  console.log('Started at port 3000');
});
