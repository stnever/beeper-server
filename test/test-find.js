var config = require('../src/config')
config.load(__dirname + '/../config.yaml')
require('../src/models').init(config)

var search = require('../src/services/search'),
    assert = require('assert'),
    debug = require('debug')('beeper:test')

describe('Beeper Search', function() {
  it('should find beeps with #error tag', function() {
    return search.searchBeeps({tags: 'error'}).then(function(data) {
      debug(data)
      assert(data.count > 0)
    })
  })
})
