/*
Account {
  // Required. Use only URL-friendly characters.
  code: 'stnever',

  // Optional, but you won't receive any emails if this is empty.
  email: 'stnever@example.com',

  // Optional. This will be used in the future to send text messages.
  phone: '555-1234',

  // This field stores the date this account was last used in the
  // webapp. This is useful to determine which messages from its
  // subscriptions are "new" or "unread".
  lastAccess: new Date('2016-03-24T14:45:00Z'),

  // Optional, the default is "human". These are useful to
  // filter flesh-and-bone user accounts, from system (bot)
  // accounts. The "root" account (created on system startup)
  // is the only one that can create other accounts.
  role: "human|system",

  // This field is not returned in API calls.
  passwordHash: 'gibberish',

  subscriptions: [
    {
      // This is a mongodb-like query object. Beeps that match
      // this query will cause a notification to be sent to this
      // account. Note that empty objects DO NOT match all beeps;
      // to do this, specify criteria: {all:true}
      criteria: Object,

      // These boolean indicate that the notification is to be
      // sent via text message or email. Additional notification
      // methods are currently being brainstormed.
      sms: false,
      email: true
    }
  ]
}
*/
var Wrapper = require('./wrapper')
module.exports = function(conn) {
  return new Wrapper('Account', {
    code: String,
    email: String,
    phone: String,
    lastAccess: Date,
    role: String,
    passwordHash: String,
    subscriptions: [{
      _id: false,
      name: String,
      criteria: {},
      sms: Boolean,
      email: Boolean,
      inbox: Boolean
    }]
  })
}
