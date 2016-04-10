var debug = require('debug')('beeper:srv'),
    httpErr = require('../utils.js').httpErr,
    _ = require('lodash'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    express = require('express'),
    models = require('../models');

var s = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
function randomAlphanumeric(num) {
  return _.times(num, function() {
    return s[_.random(0,s.length - 1)]
  }).join('');
}

function isBlank(s) {
  return s == null || s.trim().length < 1;
}

function required(obj, prop) {
  var result = obj[prop]
  if ( isBlank(result) ) throw httpErr(400, 'Missing ' + prop);
  return result
}

function findToken(code) {
  return models.Token.findOne({code: code})
}

function saveToken(token) {
  return models.Token.create(token)
}

function deleteToken(token) {
  return models.Token.destroy({code: token.code})
}

function findAccount(username) {
  return models.Account.findOne({code: username})
}

// Este metodo tenta extrair um access_token do request e colocar
// em req.accessToken. O metodo gera erros caso o request nao
// tenha token, o token nao exista, ou o token esteja invalido.
exports.extractAccessToken = function(req, res, next) {

  // Se for a URL para obtenção do token, ou outras que são
  // isentas de token, não faz nada.
  if ( req.path.indexOf('/api/oauth/access_token') == 0 ||
       req.path.indexOf('/api/v1/version') == 0 ||
       req.path.indexOf('/api/v1/health') == 0 ) {
    return next()
  }

  // somente header, não cookie
  var requestToken = req.get('access_token')

  if ( isBlank(requestToken) )
    return next(httpErr(401, 'Missing access_token'))

  return findToken(requestToken).then(function(token) {
    if ( token == null )
      return next(httpErr(401, 'Invalid token ' + requestToken))

    if ( token.status === 'revoked' )
      return next(httpErr(401, 'Revoked token ' + requestToken))

    return findAccount(token.account).then(function(acc) {
      if ( acc == null )
        return next(httpErr(401, 'Invalid token ' + requestToken))

      debug('Accessing %s %s as account %s', req.method,
        req.url, acc.account)

      req.account = acc
      req.accessToken = token

      // models.clsNamespace.set('token', token)

      next()
    })
  }).catch(next)
}

// Este metodo obtem parametros do request, valida, e cria um
// novo access_token. Erros sao gerados caso os parametros
// estejam invalidos.
exports.acquireToken = function(req, res, next) {

  Promise.try(function() {

    var grant_type = required(req.body, 'grant_type')

    if ( 'password' !== grant_type )
      throw httpErr(400, 'Unsupported grant_type ' + grant_type)

    var username = required(req.body, 'username')
    var password = required(req.body, 'password')

    return findAccount(username).then(function(acc) {
      if ( acc == null )
        throw httpErr(403, 'Invalid username');

      // Se a account não tem senha, não deixa logar
      if ( acc.passwordHash == null || acc.passwordHash == '')
        throw httpErr(403, 'Invalid password');

      return bcrypt.compareAsync(password, acc.passwordHash)
        .then(function(result) {
          if ( result == false )
            throw httpErr(403, 'Invalid password')

          debug('Creating new token for account %s', acc.code)

          var token = {
            code: randomAlphanumeric(32),
            account: acc.code
          }

          return saveToken(token).thenReturn(token)
        })
    })

  }).then(function(token) {
    res.status(200).json({access_token: token.code})
  }).catch(next)

}

exports.whoami = function(req, res, next) {
  res.json(_.omit(req.account, 'passwordHash'))
}

exports.logout = function(req, res, next) {
  return deleteToken(req.accessToken).then(function() {
    res.json({result: 'success'})
  })
}

// POST /oauth/create-token {account: 'someone@somewhere'}
exports.createToken = function(req, res, next) {
  return Promise.try(function() {
    if ( req.account.role != 'root' )
      throw httpErr(403, 'Must be root to call this api')

    return findAccount(req.body.account)
  }).then(function(acc) {
    if ( acc == null )
      throw httpErr(400, 'No such account: ' + req.body.account)

    var token = {
      code: randomAlphanumeric(32),
      account: acc.code
    }

    return saveToken(token).thenReturn(token)
  }).then(function(tok) {
    res.json({result: 'success', token: tok.code})
  }).catch(next)
}

exports.router = new express.Router()
exports.router.post('/access_token', exports.acquireToken)
exports.router.post('/logout', exports.logout)
exports.router.get('/whoami', exports.whoami)
exports.router.post('/create-token', exports.createToken)