var search = require('../src/services/search'),
    assert = require('assert')

function assertMatch(crit, beep, expected) {
  if ( expected == null ) expected = true
  assert(search.match(beep, crit) == expected)
}

describe('Beeper Search', function() {
  it('should not match empty crit', function() {
    assertMatch({}, {tags: ['a', 'b']}, false)
    assertMatch(null, {tags: ['a', 'b']}, false)
  })

  it('should match empty crit if all:true is set', function() {
    assertMatch({all:true}, {tags: ['a', 'b']})
  })

  it('should match by single source', function() {
    assertMatch({sources: 'x'}, {source:'x'})
  })

  it('should match by multiple source (OR)', function() {
    assertMatch({sources: ['x', 'y']}, {source:'x'})
  })

  it('should match by single tag', function() {
    assertMatch({tags: ['a']}, {tags:['a']})
  })

  it('should match by multiple tags (AND)', function() {
    assertMatch({tags: ['a','b']}, {tags:['a','b']})
  })

  it('should not match by multiple tags (AND)', function() {
    assertMatch({tags: ['a','b']}, {tags:['b']}, false)
  })

  it('should match by forbidden sources (AND)', function() {
    assertMatch({withoutSources:['x','y']}, {source:'z'})
  })

  it('should not match by forbidden sources (AND)', function() {
    assertMatch({withoutSources:['x','y']}, {source:'x'}, false)
  })

  it('should match by forbidden tags (AND)', function() {
    assertMatch({withoutTags:['a','b']}, {tags:['c','d']})
  })

  it('should not match by forbidden tags (AND)', function() {
    assertMatch({withoutTags:['a','b']}, {tags:['a','d']}, false)
  })

})
