var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../src/models'),
    tablify = require('./table').tablify

exports.ls = function(args) {
  return models.Source.findAll().tap(tablify({
    head: ['Source', 'Description'],
    pick: ['name', 'description']
  }))
}

exports.remove = function(args) {
  if ( args.source == null ) throw new Error('Missing --source')
  return models.Source.destroy({name: args.source})
}
