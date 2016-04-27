var _ = require('lodash'),
    Table = require('cli-table')

var emptyChars = {
   'top': '' , 'top-mid': '' , 'top-left': '' ,
   'top-right': '', 'bottom': '' , 'bottom-mid': '' ,
   'bottom-left': '' , 'bottom-right': '', 'left': '' ,
   'left-mid': '' , 'mid': '' , 'mid-mid': '',
   'right': '' , 'right-mid': '' , 'middle': ''
 }

exports.display = function(opts, rows) {
  var table = new Table({
    head: opts.head,
    chars: emptyChars,
    colWidths: opts.colWidths
  })

  rows.forEach(function(row) {
    var data = row

    if ( opts.pick ) {
      data = opts.pick.map(function(prop) {
        if ( _.isFunction(prop) ) {
          return prop(row) || 'null'
        } else {
          return _.get(data, prop, 'null')
        }
      })
    }

    table.push(data)
  })

  console.log(table.toString())
  if ( _.get(opts, 'showCount', true) )
    console.log(' ' + rows.length + ' rows.')
}

exports.tablify = function(opts) {
  return _.partial(exports.display, opts)
}

exports.detailify = function(opts) {
  return function(obj) {
    var table = new Table({
      chars: emptyChars
    })

    _.forOwn(opts.pick, function(val, key) {
      var row = {}
      if ( _.isFunction(val) ) {
        row[key] = val(obj)
      } else if ( _.isString(val) ) {
        row[key] = _.get(obj, val, 'null')
      }

      table.push(row)
    })

    console.log(table.toString())
  }
}
