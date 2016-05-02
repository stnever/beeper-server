var _ = require('lodash'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    models = require('../src/models'),
    tablify = require('./table').tablify

var padL = _.partialRight(_.padLeft, ' ')

exports.show = function(args) {
  if ( args.account == null ) throw new Error('Missing --account code')
  return models.Account.findOne({code: args.account}).tap(function(acc) {
    console.log(JSON.stringify(acc, null, ' '))
  })
}

exports.ls = function() {
  return models.Account.findAll().tap(tablify({
    head: ['Account', 'Role', 'Email', 'Has Pw?'],
    pick: ['code', 'role', 'email',
      function(row) { return (row.passwordHash != null) || false }
    ]
  }))


  // .each(function(row) {
  //   console.log('Account { code: %s, role: %s, email: %s, ' +
  //     'hasPassword: %s }',
  //     padL(row.code, 30), padL(row.role, 10),
  //     padL(row.email, 40), row.passwordHash != null)
  // })
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
