var fs = require('fs'),
    yaml = require('js-yaml'),
    _ = require('lodash');

module.exports = {

  // Loads configuration from a file and adds its properties
  // to this object.
  load: function(file) {
    var config = yaml.safeLoad(fs.readFileSync(file, 'utf-8'));
    _.assign(this, config);
  }

}