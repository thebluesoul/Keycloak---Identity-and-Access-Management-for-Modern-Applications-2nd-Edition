// Node.js에서 인증서 검증하지 않도록 설정함.
process.env["NODE_TLS_REJECT_UNAUTHORIZED"]=0;
var express = require('express');
var session = require('express-session');
var Keycloak = require('keycloak-connect');
var cors = require('cors');

var dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

var app = express();

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
  "realm": "myrealm",
  "bearer-only": true,
  "auth-server-url": process.env.KC_URL || "http://localhost:8080",
  "resource": "myclient",
  "verify-token-audience": false
};

// Keycloak 인스턴스 생성
var keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

app.use(keycloak.middleware());

app.get('/secured', keycloak.protect(['myrealm:myrole']), function (req, res) {
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
