var _ = require('lodash'),
    Promise = require('bluebird'),
    search = require('../src/services/search'),
    models = require('../src/models'),
    display = require('./table').display

exports.help = function() {
  console.log([
    'bisc beeps <criteria>',
    '',
    ' Critérios:',
    ' --fromDate        2016-06-01',
    ' --untilDate       2016-06-01',
    ' --tags            a,b,c',
    ' --withoutTags     a,b,c',
    ' --sources         x,y',
    ' --withoutSources  x,y',
    ' --offset          0',
    ' --limit           20',
    ' --sort            "timestamp DESC"',
    ''
  ].join('\n'))
}

exports.ls = function(args) {
  return search.searchBeeps(args).tap(function(data) {
    display({
      head: ['Source', 'Tags', 'Contents'],
      pick: ['source', 'tags',
        function(b) { return atMost(b.contents)}]
    }, data.rows)

    console.log(' ' + data.count + ' total rows.')
  })
}


function atMost(s) {
  return s.substring(0, 60).replace(/\n/g, ' ')
}
