// Channel {
// ???
// }
var Wrapper = require('./wrapper')
module.exports = function(db) {
  return new Wrapper('Channel',{name: String})
}
