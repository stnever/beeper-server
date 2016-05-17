var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    search = require('./search'),
    debug = require('debug')('beeper:subs')
    notifications = require('./notifications')

exports.checkSubscriptions = function(beep) {
  var emails = []

  return models.Account.findAll().map(function(account) {
    // debug('Checking subscriptions for account %s', account.code)
    var sub = _.find(account.subscriptions, function(sub) {
      return search.match(beep, sub.criteria)
    })

    if ( sub == null ) {
      debug('No matching subscriptions for account %s', account.code)
      return;
    }

    debug('Subscription match: account %s, email %s, sendEmail? %s, ' +
      'sendSms? %s, addToInbox? %s, criteria %j',
      account.code, account.email, sub.email, sub.sms, sub.inbox,
      sub.criteria)

    var promises = []
    if ( sub.sms   ) promises.push(notifications.sendSms(beep, account))
    // if ( sub.email ) promises.push(notifications.sendEmail(beep, account))
    if ( sub.email ) emails.push(account.email)

    return Promise.all(promises)
  }).then(function() {
    var to = _.compact(emails).join(',')

    // NB: this will wait for the notifications to be sent.
    return notifications.sendEmail(beep, to)
  })
}
