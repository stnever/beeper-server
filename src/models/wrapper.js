var _ = require('lodash'),
    Promise = require('bluebird'),
    mongoose = require('mongoose'),
    debug = require('debug')('beeper:models')

var Wrapper = module.exports = function Wrapper(name, spec) {
  this.model = mongoose.model(name, spec)
}

function getQueryOpts(filter) {
  filter = filter || {}
  if ( filter.sort ) {
    filter.order = filter.sort
    delete filter.sort
  }

  return _.pick(filter, 'offset', 'limit', 'order', 'attributes')
}

Wrapper.prototype.findAll = function(filter) {
  var where = _.omit(filter, 'offset', 'limit', 'order', 'sort', 'attributes');
  var query = this.model.find(where),
      opts = getQueryOpts(filter)

  debug('Where clause:', where)
  debug('Opts  clause:', opts)

  if ( opts.limit ) query.limit(opts.limit)
  if ( opts.offset ) query.skip(opts.offset)

  if ( opts.order ) {
    if ( _.isString(opts.order) ) {
      opts.order = opts.order.split(',').map(function(pair) {
        return pair.split(' ');
      })
    }

    // converte ASC para 1 e DESC para -1.
    query.sort(opts.order.map(function(pair) {
      var dir = pair[1].toUpperCase() == 'ASC' ? 1 : -1;
      return [pair[0], dir]
    }))
  }

  // TODO query.select usando os attrs
  // TODO query.populate usando include (?)

  return query.exec().then(function(rows) {
    debug('%s results', rows.length)
    return rows
  })
}

Wrapper.prototype.findOne = function(filter) {
  return this.model.findOne(filter)
}

Wrapper.prototype.findAllAndCount = function(filter) {
  var where = _.omit(filter, 'offset', 'limit', 'order', 'attributes');
  var me = this;
  var result = {}
  return me.model.count(where).exec().then(function(count) {
    result.count = count;
    return me.findAll(filter)
  }).then(function(rows) {
    result.rows = rows;
    return result
  })
}

Wrapper.prototype.findById = function(id) {
  return this.model.findById(id).exec()
}

Wrapper.prototype.destroy = function(where) {
  return this.model.remove(where)
}

Wrapper.prototype.create = function(obj) {
  return this.model.create(obj);
}

Wrapper.prototype.update = function(id, obj) {
  return this.model.findOneAndUpdate({_id: id}, obj);
}

Wrapper.prototype.bulkUpdate = function(where, what) {
  return this.model.update(where, {$set:what}, {multi: true});
}

Wrapper.prototype.count = function(filter) {
  var where = _.omit(filter, 'offset', 'limit', 'order', 'attributes')
  return this.model.count(where).exec()
}
