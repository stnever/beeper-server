var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    search = require('./search'),
    debug = require('debug')('beeper:subs')
    notifications = require('./notifications')

exports.checkSubscriptions = function(beep) {
  return models.Account.findAll().then(function(accounts) {

    var accountsToEmail = _.filter(accounts, function(a) {
      return exports.shouldSendEmail(a, beep)
    })

    // TODO idem para SMS

    if ( accountsToEmail.length < 1 ) {
      debug('No subscriptions matched this beep')
      return
    }

    debug('Accounts to be notified by email: %s',
    _.map(accountsToEmail, 'code').join(','))

    var to = _.chain(accountsToEmail)
      .map('email').compact().uniq().value().join(',')

    return notifications.sendEmail(beep, to)
  })

}

exports.shouldSendEmail = function(account, beep) {
  var ok = _.any(account.subscriptions, function(sub) {
    return sub.email && search.match(beep, sub.criteria)
  })

  return ok
}
