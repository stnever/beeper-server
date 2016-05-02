var _ = require('lodash'),
    mongoose = require('mongoose'),
    Promise = require('bluebird'),
    fs = require('fs'),
    config = require('../config');

mongoose.Promise = Promise

exports.init = function(config) {

  var connection = mongoose.connect(config.mongodb.url, {
    user : config.mongodb.username,
    pass : config.mongodb.password
  })

  fs.readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/\.js$/) !== null && file !== 'index.js'
      && file !== 'wrapper.js' ) {

      var name = _.capitalize(file.replace('.js', ''))
      exports[name] = require('./' + file)(connection)
    }
  })
}
