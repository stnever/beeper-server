var minimist = require('minimist'),
    chalk = require('chalk'),
    Promise = require('bluebird'),
    _ = require('lodash')

var args = minimist(process.argv.slice(2))

var allowed = args.allowed
if ( ! allowed ) {
  console.log('Missing --allowed param. Only emails that match() ' +
    ' this string will be kept.')
  process.exit(1)
} else {
  allowed = new RegExp(allowed)
}

var configFile = args.config || './config.yaml'

// Load config first, then models.
var config = require('../src/config')
config.load(configFile)
var models = require('../src/models')
models.init(config)

models.Account.findAll().then(function(accs) {
  return Promise.map(accs, function(acc) {
    if ( acc.email == null ) {
      console.log('Skipping account %s (no email)', acc.code)
      return
    }

    if ( acc.email.match(args.allowed) ) {
      console.log('Skipping account %s (valid email %s)', acc.code,
        acc.email)
      return
    }

    console.log('Removing bad email from account %s: %s', acc.code,
    acc.email)

    acc.email = null

    if (! args.commit ) {
      return
    }

    return models.Account.update(acc._id, acc)
  })
}).then(function() {

  if (! args.commit ) console.log('Use --commit on the command line to make this change. ' +
    'Will rollback this time.')
    
  console.log('Finished')
  process.exit()
})
