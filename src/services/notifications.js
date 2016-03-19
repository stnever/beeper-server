var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('./models')

exports.forward = function(beep) {
  return models.Account.findAll().map(function(account) {
    var rule = _.find(account.fwRules, function(rule) {
      return _.isMatch(beep, rule.criteria)
    })

    if ( rule == null ) return;

    var promises = []
    if ( rule.sms   ) promises.push(sendSms(beep, account))
    if ( rule.email ) promises.push(sendEmail(beep, account))

    return Promise.all(promises)
  })
}

function sendSms(beep, account) {
  console.log('sending sms to account %s', account)
}

function sendEmail(beep, account) {
  console.log('sending email to account %s', account)
}