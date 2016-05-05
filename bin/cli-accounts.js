var _ = require('lodash'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    models = require('../src/models'),
    tablify = require('./table').tablify,
    utils = require('../src/utils'),
    cev = require('omit-empty')

var padL = _.partialRight(_.padLeft, ' ')

exports.show = function(args) {
  if ( argv.code == null ) throw new Error('Missing account code (--code <some-account>)')
  return models.Account.findOne({code: args.code}).tap(function(acc) {
    console.log(utils.jp(acc))
  })
}

exports.ls = function() {
  return models.Account.findAll().tap(tablify({
    head: ['Account', 'Role', 'Email', 'Has Pw?'],
    pick: ['code', 'role', 'email',
      function(row) { return (row.passwordHash != null) || false }
    ]
  }))
}

function hash(password) {
  if ( password == null || password.trim().length < 1 )
    return Promise.resolve(null);
  return bcrypt.hashAsync(password, 10)
}

exports.create = function(argv) {
  if ( argv.code == null ) throw new Error('Missing account code (--code <some-account>)')
  if ( argv.role == null ) argv.role = 'human'

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
  if ( argv.code == null ) throw new Error('Missing account code (--code <some-account>)')
  return models.Account.findOne({
    code: argv.code
  }).then(function(acc) {
    if ( acc == null )
      throw new Error('No such account: ' + argv.code )

    return hash(argv.password).then(function(passwordHash) {
      _.merge(acc, cev({
        passwordHash: passwordHash,
        email: argv.email,
        role: argv.role,
        subscriptions: argv.subscriptions
      }))

      console.log('merged account:', utils.jp(acc))

      return models.Account.update(acc._id, acc)
    })
  })
}
