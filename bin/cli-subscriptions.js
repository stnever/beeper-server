var _ = require('lodash'),
    randomstring = require('randomstring'),
    Promise = require('bluebird'),
    tablify = require('./table').tablify,
    detailify = require('./table').detailify,
    models = require('../src/models'),
    search = require('../src/services/search')

var padL = _.partialRight(_.padLeft, ' ')

exports.ls = function(args) {
  if ( args.account ) {
    return models.Account.findOne({code: args.account}).tap(showSubs)
  }

  return models.Account.findAll().tap(tablify({
    head: ['Account', 'Subscriptions'],
    pick: ['code', function(acc) { return JSON.stringify(acc.subscriptions || 'null')}]
  }))
}

function showSubs(account) {
  tablify({
    head: ['#', 'All?', '+Tags', '-Tags', '+Sources', '-Sources', 'Email?', 'SMS?', 'Inbox?'],
    pick: ['$index', 'criteria.all',
      'criteria.tags', 'criteria.withoutTags',
      'criteria.sources', 'criteria.withoutSources',
      'email', 'sms', 'inbox']
  })(account.subscriptions || [])
}

exports.add = function(args) {
  if ( args.account == null ) throw new Error('Missing account')

  return models.Account.findOne({code: args.account}).then(function(acc) {
    if ( acc.subscriptions == null ) acc.subscriptions = []
    acc.subscriptions.push({
      criteria: getCriteria(args),
      email: args.email || false,
      sms: args.sms || false,
      inbox: args.inbox || false
    })

    return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
  })
}

exports.remove = function(args) {
  if ( args.account == null ) throw new Error('Missing account')
  if ( args.sub == null ) throw new Error('Missing subscription index (ex: --sub 0)')

  return models.Account.findOne({code: args.account}).then(function(acc) {
    if ( acc.subscriptions != null )
      acc.subscriptions.splice(args.sub, 1)

    return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
  })
}

function getCriteria(args) {
  return search.processFilter({
    sources: args.sources,
    withoutSources: args.withoutSources,
    tags: args.tags,
    withoutTags: args.withoutTags,
    all: (args.all == 'true' ? true : null)
  })
}

// exports.crit = function(args) {
//   if ( args.account == null ) throw new Error('Missing account')
//   if ( args.sub == null ) throw new Error('Missing subscription index (ex: --sub 0)')
//
//   return models.Account.findOne({code: args.account}).then(function(acc) {
//     if ( acc.subscriptions == null ) throw new Error('No subscriptions for account ' + args.account)
//     var sub = acc.subscriptions[args.sub]
//     if ( sub == null ) throw new Error('No subscription at index ' + args.sub + ' for account ' + args.account)
//
//     if ( args.all != null && (args.all === 'true' || args.all === true) ) {
//       sub.criteria = {all:true}
//     } else {
//       delete sub.criteria.all
//       if ( args.tags ) sub.criteria.tags = args.tags.split(',')
//       if ( args.source ) sub.criteria.source = args.source
//     }
//
//     return models.Account.update(acc._id, acc).thenReturn(acc).tap(showSubs)
//   })
// }
