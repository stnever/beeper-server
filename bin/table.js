var _ = require('lodash'),
    chalk = require('chalk'),
    table = require('table')

exports.display = function(opts, rows) {
  var data = []
  data.push(opts.head.map(function(h) { return chalk.green(h) }))

  rows.forEach(function(row, i) {
    var tabRow = opts.pick.map(function(prop) {
      if ( _.isFunction(prop) ) {
        return prop(row)
      } else if ( prop == '$index' ) {
        return i
      } else {
        var pieces = prop.split('|')
        return _.get(row, pieces[0].trim(), pieces[1] || 'null')
      }
    })

    data.push(tabRow)
  })

  var tableOpts = _.merge({}, {
    border: {
        topBody: '-',
        topJoin: '-',
        topLeft: '-',
        topRight: '-',

        bottomBody: '',
        bottomJoin: '',
        bottomLeft: '',
        bottomRight: '',

        bodyLeft: '',
        bodyRight: '',
        bodyJoin: ' ',

        joinBody: '-',
        joinLeft: '',
        joinRight: '',
        joinJoin: ''
    },
    columnDefault: { paddingLeft: 1, paddingRight: 1 },
    drawHorizontalLine: function(i) { return i == 1 }
  }, _.omit(opts, 'head', 'pick', 'showCount'))

  // default pq o módulo table é ES2015
  var output = table.default(data, tableOpts)

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
