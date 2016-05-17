#!/usr/bin/env node
var minimist = require('minimist'),
    chalk = require('chalk'),
    Promise = require('bluebird')

var args = minimist(process.argv.slice(2))

var configFile = args.config || './config.yaml'

// Load config first, then models.
var config = require('../src/config').load(configFile)
require('../src/models').init(config)

// Only setup email if there's a flag for it. If the flag is
// not set, notifications will be logged, but not sent.
if ( args.setupEmail ) {
  require('../src/services/notifications').init(config)
}

// Load subcommands
var commands = {
  post: require('./cli-post'),
  accounts: require('./cli-accounts'),
  tokens: require('./cli-tokens'),
  subscriptions: require('./cli-subscriptions'),
  subs: require('./cli-subscriptions'),
  tags: require('./cli-tags'),
  sources: require('./cli-sources')
}

function outputHelp() {
  var s = require('fs').readFileSync(__dirname + '/help.md', 'utf-8')
  console.log(s)
}

return Promise.try(function() {
  var c1 = args._.shift()
  if ( c1 == null || c1 == 'help' || args.help )
    return outputHelp()

  var command = commands[c1]
  if ( command == null )
    throw new Error('No such command: ' + c1)

  var c2 = args._.shift()
  var subcommand = command[c2 || 'ls']
  if ( subcommand == null )
    throw new Error('No such subcommand: ' + c2)

  return subcommand(args)

}).catch(function(err) {

  if ( args.v ) console.log(err.stack)
  else console.log('\n' + chalk.red(err.name) + ' ' + err.message)

}).then(function() {
  process.exit()
})
