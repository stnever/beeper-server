var _ = require('lodash'),
    Promise = require('bluebird'),
    service = require('../src/services/beeper-service')

exports.ls = function(args) {
  if ( args.source == null ) throw new Error('Missing --source')
  if ( args.contents == null ) throw new Error('Missing --contents')

  var beep = {
    source: args.source,
    contents: args.contents
  }

  if ( args.tags ) beep.tags = args.tags.split(',')

  if ( args.data ) beep.data = args.data

  console.log('Creating beep: %s', JSON.stringify(beep, null, ' '))

  return service.create(beep)
}
