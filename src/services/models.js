var monk = require('monk'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    config = require('../config');

var db = monk(config.mongodb.url, {
  username : config.mongodb.username,
  password : config.mongodb.password
});

function Wrapper(name) {
  this.collection = Promise.promisifyAll(db.get(name));
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

module.exports = {
  Source: new Wrapper('sources'),
  Beep: new Wrapper('beeps'),
  Token: new Wrapper('tokens'),
  Channel: new Wrapper('channels')
}