var search = require('../src/services/search'),
    assert = require('assert')

describe('Beeper Search', function() {
  it('should match filter', function() {
    var beep = {tags: ['a', 'b']}
    assert(search.match(beep, {tags: ['a']}))
  })

  it('should match source', function() {
    var beep = {source: 'x'}
    assert(search.match(beep, {source: 'x'}))
  })

  it('should not match empty criteria unless all:true is set', function() {
    var beep = {source: 'x'}
    assert.equal(search.match(beep, null), false)
    assert.equal(search.match(beep, {}), false)
    assert.equal(search.match(beep, {all:true}), true)
  })
})
