var _ = require('lodash'),
    randomstring = require('randomstring'),
    Promise = require('bluebird'),
    models = require('../src/models'),
    tablify = require('./table').tablify

var padL = _.partialRight(_.padLeft, ' ')

exports.ls = function() {
  return models.Token.findAll().tap(tablify({
    head: ['Code', 'Account'],
    pick: ['code', 'account']
  }))
}

exports.create = function(args) {
  if ( args.account == null ) throw new Error('Missing account')
  if ( args.code == null )
    args.code = randomstring.generate()

  return models.Token.create({
    code: args.code,
    account: args.account
  })
}

exports.delete = function(args) {
  if ( args.code == null ) throw new Error('Missing token code')
  return models.Token.destroy({code: args.code})
}
