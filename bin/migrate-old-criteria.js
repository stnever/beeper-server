#!/usr/bin/env node
var minimist = require('minimist'),
    chalk = require('chalk'),
    Promise = require('bluebird'),
    _ = require('lodash')

var args = minimist(process.argv.slice(2))

var configFile = args.config || './config.yaml'

// Load config first, then models.
var config = require('../src/config')
config.load(configFile)
var models = require('../src/models')
models.init(config)

var search = require('../src/services/search')

models.Account.findAll().then(function(accs) {
  return Promise.map(accs, function(acc) {
    if ( !acc.subscriptions ) {
      console.log('No subscriptions for account %s', acc.code)
      return
    }

    acc.subscriptions.forEach(function(sub) {
      var before = _.clone(sub.criteria),
          after = search.processFilter(sub.criteria)

      // console.log('-------')
      // console.log('account %s %s', acc.code, acc._id)
      // console.log('before: %s', JSON.stringify(before, null, ' '))
      // console.log('after : %s', JSON.stringify(after, null, ' '))

      sub.criteria = after
    })

    console.log('after updates: %j', acc)
    return models.Account.update(acc._id, acc).then(function(data) {
      console.log('\n\ndata %j', data)
    }).catch(function(err) {
      console.log(err.stack)
    })
  })
}).then(function() {
  console.log('Finished')
  process.exit()
})
