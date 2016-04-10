// Beep {
//   // ID of this beep. Ignored when creating, auto-generated
//   // via the `shortid` module.
//   id: 'EkwGRKN5g',

//   // UTC Timestamp when the beep was received.
//   // This is ignored when creating a beep; if you want
//   // to store a different date than "the date when the
//   // request reached the API", consider adding it to
//   // the "data" object below.
//   timestamp: '2015-08-25T13:45:00Z',

//   // The content. Required when creating a beep.
//   contents: 'The #webserver is up'

//   // The source of the beep. Required when creating the
//   // beep. Metadata about this source can be queried
//   // separately (e.g. GET /sources/:name)
//   source: 'server1/webserver',

//   // A list of tags. This can be useful to make beeps easier
//   // to find later. The contents are simple strings (with no
//   // hashes).
//   //
//   // This field may be null or omitted when posting, but will
//   // be at least an empty array when retrieving.
//   //
//   // Note that if the contents field includes #hashtags when
//   // posting, they will be automatically parsed, and will be
//   // present in this array (minus the hash) when retrieving.
//   // (and will, of course, be present unchanged in the
//   // contents). The purpose of this field when posting is so
//   // you can add tags without having to mess the contents.
//   tags: [ 'webserver' ],

//   // Any other information that you want to attach to this
//   // beep. May be null when posting, will be at least an
//   // empty object when retrieving.
//   data: {
//     serverPort: 8080,
//     serverPid: 1234,
//     ...
//   }
// }
var Wrapper = require('./wrapper')
module.exports = function(db) {
  return new Wrapper(db, 'beeps')
}