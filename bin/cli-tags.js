var _ = require('lodash'),
    Promise = require('bluebird'),
    tagCloud = require('../src/services/tag-cloud'),
    tablify = require('./table').tablify

exports.ls = function(args) {
  var filter = {sources: args.sources}
  return tagCloud.calculateTagCloud(filter).tap(tablify({
    head: ['Tag', 'Count'],
    pick: ['tag', 'count']
  }))
}
