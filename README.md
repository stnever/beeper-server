Beeper is your own Twitter, to collect info from your projects.

### Alpha release, expect bugs and missing functionality.

The `beeper-server` module is a simple webapp and API server, based on Node.js, MongoDB, and AngularJS. You can install it on a server you own and access it to query information, and post "beeps".

Most likely, you'll want to use the `beeper-client` module to post information to your Beeper server from programs you develop. For example, a cron job might post a beep when it executes, or a service might post a beep when it becomes active.

# Installing

  1. First, install mongodb, according to their [install guide](http://docs.mongodb.org/master/installation/#installation-guides). (Most package managers are supported).
  2. Clone this repository on a directory on your system.
  3. On that directory, run `npm install` to fetch dependencies.
  4. Copy `config-sample.yaml` to `config.yaml` and fill in the database url, user and password, and any other properties you wish to change.
  4. Run `npm start` to start the server.
  5. Access the webapp by pointing your browser to (by default) `http://localhost:4444/index.html`

# Concepts

## Sources

Sources are analogous to user accounts on Twitter: every beep has an associated source. However, source names may have the '/' character, to indicate it is a "subsystem" of another system: for example, the `server1` source posts messages about server startup and shutdown, while the `server1/httpd` source posts messages about the HTTP daemon on that server.

Usually, the `access_token` that is used during calls to the REST API has rules that state which sources it can post under. By default, however, any token can be used with any source.

Sources don't need to be created before you can use them (though you can if you want). Just post a message to a source and it will be created if it doesn't exist. This behaviour can be changed on a per-access-token basis.

The JSON representation of a source looks like this:

    {
      name: 'server1',
      description: 'Server 1 messages',
      image: '0a2bfd...'
    }

## Beeps

Beeps are analogous to tweets. They usually have the following JSON representation:

    {
      // ID of this beep. Ignored when creating, auto-generated
      // via the `shortid` module.
      id: 'EkwGRKN5g',

      // UTC Timestamp when the beep was received.
      // This is ignored when creating a beep; if you want
      // to store a different date than "the date when the
      // request reached the API", consider adding it to
      // the "data" object below.
      timestamp: '2015-08-25T13:45:00Z',

      // The content. Required when creating a beep.
      contents: 'The #webserver is up'

      // The source of the beep. Required when creating the
      // beep. Metadata about this source can be queried
      // separately (e.g. GET /sources/:name)
      source: 'server1/webserver',

      // A list of tags. This can be useful to make beeps easier
      // to find later. The contents are simple strings (with no
      // hashes).
      //
      // This field may be null or omitted when posting, but will
      // be at least an empty array when retrieving.
      //
      // Note that if the contents field includes #hashtags when
      // posting, they will be automatically parsed, and will be
      // present in this array (minus the hash) when retrieving.
      // (and will, of course, be present unchanged in the
      // contents). The purpose of this field when posting is so
      // you can add tags without having to mess the contents.
      tags: [ 'webserver' ],

      // Any other information that you want to attach to this
      // beep. May be null when posting, will be at least an
      // empty object when retrieving.
      data: {
        serverPort: 8080,
        serverPid: 1234,
        ...
      }
    }

## Channels

Channels are simply saved searches. They are useful to create quick bookmarks to common views into the data. For example, you can create a channel that lists all the beeps with the `#webserver` tag, or all beeps from sources `server1` and `server2`, or many other combinations.

## Accounts

Accounts represent users. This is used both to authenticate viewers
of the web application, and also to store Subscriptions. Subscriptions
are a way to say, "send me an email when a beep with these characteristics
is received".

The JSON representation is as follows:

  {
    # Required. Use only URL-friendly characters.
    code: 'stnever',

    # Optional, but you won't receive any emails if this is empty.
    email: 'stnever@example.com',

    # Optional. This will be used in the future to send text messages.
    phone: '555-1234',

    # This field stores the date this account was last used in the
    # webapp. This is useful to determine which messages from its
    # subscriptions are "new" or "unread".
    lastAccess: new Date('2016-03-24T14:45:00Z'),

    # Optional, the default is "human". These are useful to
    # filter flesh-and-bone user accounts, from system (bot)
    # accounts. The "root" account (created on system startup)
    # is the only one that can create other accounts.
    role: "human|system"

    subscriptions: [
      {
        # This is a mongodb-like query object. Beeps that match
        # this query will cause a notification to be sent to this
        # account. Note that empty objects DO NOT match all beeps;
        # to do this, specify criteria: {all:true}
        criteria: Object,

        # These boolean indicate that the notification is to be
        # sent via text message or email. Additional notification
        # methods are currently being brainstormed.
        sms: false,
        email: true
      }
    ]
  }

Accounts also have a password, but it is not associated with the resource
above. To change it, check the OAuth documentation below.

# REST API

The Beeper service provides a simple REST api to post and retrieve beeps:

    GET    /beeps            # retrieves a paginated list of beeps,
                             # optionally matching a certain filter

    GET    /beeps/:id        # Retrieve a certain beep by its ID.

    POST   /beeps            # Posts one or more beeps.

    DELETE /beeps/:id        # Deletes an existing beep.

There are similar endpoints for sources and channels:

    GET    /sources
    GET    /sources/:name    # works even for sub-sources, e.g.
                             # /sources/server1/web
    POST   /sources/:name
    DELETE /sources/:name

    GET    /channels
    GET    /channels/:name         # This retrieves metadata about the
                                   # channel, such as the query that it
                                   # contains.
    GET    /channels/:name/beeps   # Retrieves a paginated list of beeps
                                   # that match this channel's saved query
    POST   /channels
    PUT    /channels/name
    DELETE /channels/:name

When calling the API, you must send an authentication token as a header. However, for testing purposes (or if the environment with access to the Beeper server is trusted), you may use the `anonymous` token:

    curl -H "access_token: anonymous"

If the server is to be publicly accessible, however, you should disable this token and issue tokens only to trusted clients.

## OAuth

This server uses a subset of the OAuth authorization flow.

To change a password, one must call:

    POST /accounts/:code/password
    {"newPassword": "xyz"}

Note that this API call *requires* an `access_token`. Furthermore, the
token must either be associated with a root account, or the same account
being changed.

To log in and obtain a token, one must call:

    POST /oauth/access_token
    {"grant_type": "password", "username": "stnever", "password": "abc"}

The response (if successfull) will contain the access_token to be used
in all subsequent operations:

    {"access_token": 'XYZabc123'}

Note that this flow applies to both human users, and external systems.
However, external systems CANNOT change their own passwords; this
can only be done by a root account.




