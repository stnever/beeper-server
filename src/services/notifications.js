var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    nodemailer = require('nodemailer'),
    showdown = require('showdown'),
    converter = new showdown.Converter(),
    debug = require('debug')('beeper:notify')

var sendAsync = null,
    emailConfig = null

exports.init = function(config) {
  if ( config.email == null ) return;

  emailConfig = config.email
  var transporter = nodemailer.createTransport(emailConfig)

  sendAsync = function(opts) {
    return new Promise(function(resolve, reject) {
      transporter.sendMail(opts, function(error, info) {
        if ( error ) reject(error); else resolve(info)
      })
    })
  }
}

exports.forward = function(beep) {

  return models.Account.findAll().map(function(account) {
    debug('Checking subscriptions for account %s', account.code)
    var rule = _.find(account.subscriptions, function(rule) {
      if ( rule.criteria.all == true ) return true;
      return _.isMatch(beep, rule.criteria)
    })

    if ( rule == null ) {
      debug('No matching rules')
      return;
    }

    debug('Rule match:', rule)

    var promises = []
    if ( rule.sms   ) promises.push(sendSms(beep, account))
    if ( rule.email ) promises.push(sendEmail(beep, account))

    return Promise.all(promises)
  })
}

function sendSms(beep, account) {
  debug('sending sms to account %s', account)
}

var sendAsync = null

function sendEmail(beep, account) {
  debug('sending email to account %s: %s (nodemailer set up?)',
    account.code, account.email, sendAsync != null)

  if ( account.email == null ||
    account.email.trim().length < 1 )
    return Promise.resolve();

  if ( !sendAsync ) return Promise.resolve();

  var html = _.get(beep, 'data.emailHtml')
  if ( html == null ) {
    // TODO: use a module like require('xss')
    // to prevent XSS vulnerabilities in the resulting
    // HTML.
    html = converter.makeHtml(beep.contents)

    if ( emailConfig.baseUrl ) {
      html += '----\n' + emailConfig.baseUrl +
        '/#/beeps/' + beep._id
    }
  }

  var mail = {
    to: account.email,
    from: _.get(beep, 'data.emailFrom', emailConfig.defaultSender),
    subject: _.get(beep, 'data.emailSubject', firstLine(beep.contents)),
    html: html
  }

  return sendAsync(mail).tap(function() {
    debug('Email sent')
  }).catch(function(err) {
    debug(err.stack)
  })
}

function firstLine(s) {
  var i = s.indexOf('\n');
  if ( i != -1 ) s = s.substring(0, i);

  if ( s.length <= 60 ) return s;

  s = s.substring(0, 60)

  i = s.lastIndexOf(' ')
  if ( i != null ) {
    s = s.substring(0, i)
  }

  return s + '...'
}