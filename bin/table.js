var _ = require('lodash'),
    chalk = require('chalk'),
    table = require('table')

exports.display = function(opts, rows) {
  var data = []
  data.push(opts.head.map(function(h) { return chalk.green(h) }))

  rows.forEach(function(row) {
    var tabRow = opts.pick.map(function(prop) {
      if ( _.isFunction(prop) ) {
        return prop(row) || 'null'
      } else {
        return _.get(row, prop, 'null')
      }
    })

    data.push(tabRow)
  })

  var output = table.default(data, {
    border: table.getBorderCharacters('void'),
    columnDefault: { paddingLeft: 1, paddingRight: 1 },
    drawHorizontalLine: function() { return false }
  })

  console.log(output)
  if ( _.get(opts, 'showCount', true) )
    console.log(' ' + rows.length + ' rows.')
}

exports.tablify = function(opts) {
  return _.partial(exports.display, opts)
}

// exports.detailify = function(opts) {
//   return function(obj) {
//     var table = new Table({
//       chars: emptyChars
//     })
//
//     _.forOwn(opts.pick, function(val, key) {
//       var row = {}
//       if ( _.isFunction(val) ) {
//         row[key] = val(obj)
//       } else if ( _.isString(val) ) {
//         row[key] = _.get(obj, val, 'null')
//       }
//
//       table.push(row)
//     })
//
//     console.log(table.toString())
//   }
// }
