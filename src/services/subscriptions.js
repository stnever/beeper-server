var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    search = require('./search'),
    debug = require('debug')('beeper:subs')
    notifications = require('./notifications')

exports.checkSubscriptions = function(beep) {
  return models.Account.findAll().map(function(account) {
    // debug('Checking subscriptions for account %s', account.code)
    var sub = _.find(account.subscriptions, function(sub) {
      return search.match(beep, sub.criteria)
    })

    if ( sub == null ) {
      debug('No matching subscriptions for account %s', account.code)
      return;
    }

    debug('Subscription match: account %s, criteria %j',
      account.code, sub.criteria)

    var promises = []
    if ( sub.sms   ) promises.push(notifications.sendSms(beep, account))
    if ( sub.email ) promises.push(notifications.sendEmail(beep, account))

    return Promise.all(promises)
  })
}
