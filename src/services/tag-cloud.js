var _ = require('lodash'),
    Promise = require('bluebird'),
    models = require('../models'),
    cev = require('omit-empty'),
    utils = require('../utils.js')

function m(s) {
  if ( s == null || s.trim().length < 1 ) return null
  return moment(s)
}

exports.calculateTagCloud = function(filter) {
  filter = filter || {}

  function map() {
    if ( !this.tags ) {
      return
    }

    for (index in this.tags) {
      emit(this.tags[index], 1)
    }
  }

  function reduce(previous, current) {
    var count = 0

    for (index in current) {
      count += current[index]
    }

    return count
  }

  var opts = {
    map: map,
    reduce: reduce,
    out: {inline: 1}
  }

  opts.query = cev({
    timestamp: {
      $gte: m(filter.fromDate),
      $lte: m(filter.untilDate)
    },
    tags: {
      $all: utils.s2a(filter.tags),
      $nin: utils.s2a(filter.withoutTags)
    },
    source: {
      $in: utils.s2a(filter.sources),
      $nin: utils.s2a(filter.withoutSources)
    }
  })

  return models.Beep.model.mapReduce(opts).then(function(rows) {
    return _.chain(rows).sortBy('value').map(function(row) {
      return {tag: row._id, count: row.value}
    }).reverse().value()
  })
}
