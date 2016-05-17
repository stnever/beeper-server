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

exports.sendSms = function(beep, account) {
  debug('Sending sms to account %s', account)
  return Promise.resolve()
}

var sendAsync = null

exports.sendEmail = function(beep, to) {
  debug('Sending email to %s (nodemailer set up? %s)',
    to, sendAsync != null)

  if ( to == null || to.trim().length < 1 )
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
    to: to,
    from: _.get(beep, 'data.emailFrom', emailConfig.defaultSender),
    subject: _.get(beep, 'data.emailSubject', firstLine(beep.contents)),
    html: html
  }

  return sendAsync(mail).tap(function() {
    debug('Email sent to %s', to)
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
