var _ = require('lodash'),
    randomstring = require('randomstring'),
    Promise = require('bluebird'),
    tablify = require('./table').tablify,
    detailify = require('./table').detailify,
    models = require('../src/models')

var padL = _.partialRight(_.padLeft, ' ')

exports.ls = function() {
  return models.Account.findAll().tap(tablify({
    head: ['Account', 'Subscriptions'],
    pick: ['code', function(acc) { return JSON.stringify(acc.subscriptions || 'null')}]
  }))
}

function showSubs(account) {
  tablify({
    head: ['All?', 'Tags', 'Source', 'Email?', 'SMS?'],
    pick: ['criteria.all', 'criteria.tags', 'criteria.source', 'email', 'sms'],
    colWidths: [10, 30, 20, 10, 10]
  })(account.subscriptions)
}

exports.add = function(args) {
  if ( args.account == null ) throw new Error('Missing account')

  return models.Account.findOne({code: args.account}).then(function(acc) {
    if ( acc.subscriptions == null ) acc.subscriptions = []
    acc.subscriptions.push({criteria:{}, email: args.email || false, sms: args.sms || false})
    return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
  })
}

exports.remove = function(args) {
  if ( args.account == null ) throw new Error('Missing account')
  if ( args.sub == null ) throw new Error('Missing subscription index (ex: --sub 0)')

  return models.Account.findOne({code: args.account}).then(function(acc) {
    if ( acc.subscriptions != null )
      acc.subscriptions.splice(args.sub)

    return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
  })
}

exports.crit = function(args) {
  if ( args.account == null ) throw new Error('Missing account')
  if ( args.sub == null ) throw new Error('Missing subscription index (ex: --sub 0)')

  return models.Account.findOne({code: args.account}).then(function(acc) {
    if ( acc.subscriptions == null ) throw new Error('No subscriptions for account ' + args.account)
    var sub = acc.subscriptions[args.sub]
    if ( sub == null ) throw new Error('No subscription at index ' + args.sub + ' for account ' + args.account)

    if ( args.all != null && (args.all === 'true' || args.all === true) ) {
      sub.criteria = {all:true}
    } else {
      delete sub.criteria.all
      if ( args.tags ) sub.criteria.tags = args.tags.split(',')
      if ( args.source ) sub.criteria.source = args.source
    }

    return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
  })
}
