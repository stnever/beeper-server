// Channel {
// ???
// }
var Wrapper = require('./wrapper')
module.exports = function(db) {
  return new Wrapper(db, 'channels')
}