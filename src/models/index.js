var _ = require('lodash'),
    monk = require('monk'),
    fs = require('fs'),
    config = require('../config');

exports.init = function(config) {

  var db = monk(config.mongodb.url, {
    username : config.mongodb.username,
    password : config.mongodb.password
  });

  fs.readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/\.js$/) !== null && file !== 'index.js'
      && file !== 'wrapper.js' ) {

      var name = _.capitalize(file.replace('.js', ''))
      exports[name] = require('./' + file)(db)
    }
  })
}
