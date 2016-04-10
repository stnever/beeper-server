// Token {
//   code: 'xyzabc123',
//   account: 'stnever@hlg' // not the ObjectId
// }
var Wrapper = require('./wrapper')
module.exports = function(db) {
  return new Wrapper(db, 'tokens')
}