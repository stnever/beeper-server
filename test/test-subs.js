var config = require('../src/config')
config.load(__dirname + '/../config.yaml')
require('../src/models').init(config)

var subscriptions = require('../src/services/subscriptions'),
    assert = require('assert'),
    debug = require('debug')('beeper:test')

var beep = {
  source: 'novorumo',
  tags: [ 'vehicle-state', 'check' ]
}

function assertEmail(subs, expected) {
  if ( expected == null ) expected = true
  var s = subscriptions.shouldSendEmail({subscriptions: subs}, beep)
  assert(s == expected)
}

describe('Beeper Subscriptions', function() {
  it('should not send email for account with no subs', function() {
    assertEmail([], false)
  })

  it('should not send email for account with no matching subs', function() {
    assertEmail([
      {criteria: {sources:['whatever']}, email:true}
    ], false)
  })

  it('should not send email for account with matching subs but no email', function() {
    assertEmail([
      {criteria: {sources:['novorumo']}, email:false}
    ], false)
  })

  it('should send email for account with matching sub with email', function() {
    assertEmail([{criteria: {sources:['novorumo']}, email: true}])
  })

  it('should send email for account with several matching subs, only one with email', function() {
    assertEmail([
      {criteria: {sources:['novorumo']}, email:false},
      {criteria: {tags:['check']}, email: true}
    ])
  })
})
