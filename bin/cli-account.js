var _ = require('lodash'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    models = require('../src/models')

var padL = _.partialRight(_.padLeft, ' ')

exports.ls = function() {
  return models.Account.findAll().each(function(row) {
    console.log('Account { code: %s, role: %s, email: %s, ' +
      'hasPassword: %s }',
      padL(row.code, 30), padL(row.role, 10),
      padL(row.email, 40), row.passwordHash != null)
  })
}

function hash(password) {
  if ( password == null || password.trim().length < 1 )
    return Promise.resolve(null);
  return bcrypt.hashAsync(password, 10)
}

exports.create = function(argv) {
  if ( argv.code == null ) throw new Error('Missing account code')
  if ( argv.role == null ) role = 'human'

  return hash(argv.password).then(function(passwordHash) {
    return models.Account.create({
      code: argv.code,
      passwordHash: passwordHash,
      role: argv.role,
      email: argv.email
    })
  })
}

exports.update = function(argv) {
  return models.Account.findOne({
    code: argv.code
  }).then(function(acc) {
    if ( acc == null )
      throw new Error('No such account: ' + argv.code )

    return hash(argv.password).then(function(passwordHash) {
      _.merge(acc, {
        passwordHash: passwordHash,
        email: argv.email,
        role: argv.role,
        subscriptions: argv.subscriptions
      })

      console.log('merged account:', acc)

      return models.Account.update(acc._id, acc)
    })
  })
}