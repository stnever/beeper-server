// Formato do objeto filter:
// {
//   fromDate      : Date|String,
//   untilDate     : Date|String,
//   tags          : [String]|String,
//   withoutTags   : [String]|String,
//   sources       : [String]|String,
//   withoutSources: [String]|String,
//   inInbox       : [String]|String, ???
//   offset        : Number,
//   limit         : Number,
//   sort          : String,
//   countOnly     : Boolean
// }
//
var _ = require('lodash'),
    moment = require('moment'),
    models = require('../models'),
    cev = require('omit-empty'),
    debug = require('debug')('beeper:srv')

function trim(s) { return s == null ? '' : s.trim() }

function arr(obj) {
  if ( obj == null ) return null

  if ( _.isString(obj) ) obj = obj.split(',')
  var result = _.chain(obj)
    .map(function(s) { return s.split(',') })
    .flatten()
    .map(trim)
    .without('')
    .value()

  if ( result.length < 1 ) return null
  return result
}

function hasAny(a, b) {
  return _.intersection(a, b).length > 0
}

function hasAll(a, b) {
  return _.difference(b, a).length == 0
}

function m(s) {
  if ( s == null || s.trim().length < 1 ) return null
  return moment(s)
}

exports.processFilter = function(filter) {
  if ( filter == null ) return {}

  if ( filter.source ) {
    filter.sources = filter.source
    delete filter.source
  }

  ['tags', 'withoutTags', 'sources', 'withoutSources'].forEach(function(p) {
    filter[p] = arr(filter[p])
  });

  ['fromDate', 'untilDate'].forEach(function(p) {
    if ( filter[p] && filter[p].trim().length < 1 )
      filter[p] = null
  });

  ['limit', 'offset'].forEach(function(p) {
    if ( filter[p] ) filter[p] = +filter[p]
  });

  return cev(filter)
}

exports.match = function(beep, filter) {
  filter = exports.processFilter(filter)

  // Se o filtro está vazio, então retorna FALSE.
  // A menos que seja all:true.
  var pick = cev(_.pick(filter, 'fromDate', 'untilDate',
    'tags', 'withoutTags', 'sources', 'withoutSources'))
  if ( _.isEmpty(pick) ) {
    if ( filter.all == true ) return true
    else return false
  }

  var ok = true;

  if ( filter.fromDate ) // inclusive
    ok = ok && !moment(beep.timestamp).isBefore(filter.fromDate)

  if ( filter.untilDate ) // exclusive
    ok = ok && moment(beep.timestamp).isBefore(filter.untilDate)

  // Tem que ter todas
  if ( filter.tags && !hasAll(beep.tags, filter.tags) )
    ok = false

  // Não pode ter nenhuma
  if ( filter.withoutTags && hasAny(beep.tags, filter.withoutTags ) )
    ok = false

  // Tem que ter ao menos uma
  if ( filter.sources && !hasAny([beep.source], filter.sources) )
    ok = false

  // Não pode ter nenhuma
  if ( filter.withoutSources && hasAny([beep.source], filter.withoutSources ) )
    ok = false

  return ok
}

exports.searchBeeps = function(filter) {
  filter = exports.processFilter(filter)
  var where = cev({
    timestamp: {
      $gte: m(filter.fromDate),
      $lte: m(filter.untilDate)
    },
    tags: {
      $all: filter.tags,
      $nin: filter.withoutTags
    },
    source: {
      $in: filter.sources,
      $nin: filter.withoutSources
    },
    offset: filter.offset || 0,
    limit: filter.limit || 20,
    sort: filter.sort || 'timestamp DESC'
  })

  // Data filters use the mongodb query format.
  // _.forOwn(req.query, function(v, k) {
  //   if ( v == null || v.trim().length < 1 ) return;
  //   if ( k.indexOf('data.') !== 0 ) return;
  //
  //   where[k] = JSON.parse(v)
  // })

  var countOnly =
    (filter.countOnly === 'true') ||
    (filter.countOnly === true)

  debug('Beeps filter: %j (count only? %s)', where, countOnly)

  if ( countOnly ) {
    return models.Beep.count(where).then(function(n) {
      return {count: n}
    })
  } else {
    return models.Beep.findAllAndCount(where)
  }
}
