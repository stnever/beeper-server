var _ = require('lodash'),
    randomstring = require('randomstring'),
    Promise = require('bluebird'),
    models = require('../src/models')

var padL = _.partialRight(_.padLeft, ' ')

exports.ls = function() {
  return models.Token.findAll().each(function(row) {
    console.log('Token { code: %s , account: %s }',
      padL(row.code, 32), padL(row.account, 20))
  })
}

exports.create = function(args) {
  if ( args.account == null ) throw new Error('Missing account')

  return models.Token.create({
    code: randomstring.generate(),
    account: args.account
  })
}

exports.delete = function(args) {
  if ( args.code == null ) throw new Error('Missing token code')
  return models.Token.destroy({code: args.code})
}