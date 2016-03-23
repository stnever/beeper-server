var monk = require('monk'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    config = require('../config');

exports.init = function(config) {

  var db = monk(config.mongodb.url, {
    username : config.mongodb.username,
    password : config.mongodb.password
  });

  _.assign(exports, {
    Source: new Wrapper(db, 'sources'),
    Beep: new Wrapper(db, 'beeps'),
    Token: new Wrapper(db, 'tokens'),
    Channel: new Wrapper(db, 'channels'),
    Account: new Wrapper(db, 'accounts')
  })
}

function Wrapper(db, name) {
  this.collection = Promise.promisifyAll(db.get(name));
}

Wrapper.prototype.findAndCountAll = function(filter) {
  var me = this
  return me.count(filter).then(function(count) {
    return me.findAll(filter).then(function(rows) {
      return {count: count, rows: rows}
    })
  })
}

Wrapper.prototype.findAll = function(filter) {
  var opts = _.pick(filter, 'offset', 'limit', 'sort');
  var where = _.omit(filter, 'offset', 'limit', 'sort');

  if ( _.isString(opts.sort) ) {
    opts.sort = opts.sort.split(',').map(function(pair) {
      return pair.split(' ');
    })
  }

  if ( opts.offset ) { opts.skip = opts.offset; delete opts.offset }
  return this.collection.findAsync(where, opts);
}

Wrapper.prototype.count = function(filter) {
  var where = _.omit(filter, 'offset', 'limit', 'sort')
  return this.collection.countAsync(where)
}

Wrapper.prototype.findOne = function(where) {
  return this.collection.findOneAsync(where)
}

Wrapper.prototype.findById = function(id) {
  return this.collection.findByIdAsync(id)
}

Wrapper.prototype.destroy = function(where) {
  return this.collection.removeAsync(where)
}

Wrapper.prototype.create = function(obj) {
  return this.collection.insertAsync(obj);
}

Wrapper.prototype.update = function(id, obj) {
  return this.collection.updateByIdAsync(id, {$set: obj});
}

Wrapper.prototype.bulkUpdate = function(where, what) {
  return this.collection.updateAsync(where, what);
}

