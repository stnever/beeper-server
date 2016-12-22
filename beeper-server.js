var path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    expro = require('./src/expro'),
    glob = require('glob'),
    debug = require('debug'),
    log = debug('beeper:srv'),
    oauth = require('./src/rest/oauth'),
    config = require('./src/config');

// Load configuration from file.
var configFile = process.argv.length > 2
  ? path.resolve(process.argv[2])
  : path.resolve(__dirname, 'config.yaml')

debug.log = console.log.bind(console)

config.load(configFile);

// AFTER we have the configuration, set up other
// services that depends on it. If we require some
// of these before this time, they may end up
// require-ing incomplete services.
require('./src/models').init(config)
require('./src/services/notifications').init(config)

var app = exports.app = express();
app.use(cors());
app.use(express.static(__dirname + '/node_modules/beeper-web'));
app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json


// // Extrai informação do accessToken em toda chamada a /api/*
// app.use('/api', oauth.extractAccessToken);

// // Impede acesso a PUT/POST/DELETE por viewers, com algumas exceções.
// app.use('/api', oauth.preventWriteAccessByViewers);

// Login (geração de token) e logout. Observe que algumas destas
// URLs são interceptadas pelo /api/* acima.
// app.post('/oauth/access_token', oauth.createToken);
// app.post('/api/v1/logout', oauth.logout);
// app.get('/api/v1/whoami', oauth.whoami);

app.use(oauth.extractAccessToken)

// Loga método, url, e body.
app.use(function(req, res, next) {
  log(req.method, req.url, req.body || '');
  next();
})

app.use(expro); // allow returning promises on routes.

app.use('/api/oauth', oauth.router)

// Le todos os arquivos em rest e adiciona como rotas
glob.sync('src/rest/*.js', {cwd: __dirname}).forEach(function(fname) {
  var base = path.basename(fname, '.js');
  var realPath = path.join(__dirname, fname);
  if ( base != 'oauth' )
    app.use('/api/' + base, require(realPath));
})

// Seta o logger para o error handler e pluga o handler no final
app.use(expro.errorHandler);

app.listen(config.server.port, function() {
  log('Beeper-Server listening on port %s', config.server.port);
});
