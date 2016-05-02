// Source {
//   name: 'server1',
//   description: 'Server 1 messages',
//   image: '0a2bfd...'
// }
var Wrapper = require('./wrapper')
module.exports = function(db) {
  return new Wrapper('Source', {
    name: String,
    description: String    
  })
}
