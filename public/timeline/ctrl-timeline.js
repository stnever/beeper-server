var utils = require('../services/utils'),
    _ = require('lodash'),
    cev = require('omit-empty'),
    app = module.exports = angular.module('BeeperWeb')

app.config(function($routeProvider) {
  $routeProvider
    .when('/timeline', {
      templateUrl: 'timeline/timeline.html',
      controller: 'TimelineController',
      reloadOnSearch: false
    })
  }
)

function dt(s) { return s == null ? null : moment(s).toDate() }
function a(s) { return s == null ? []   : s.split(',') }

function set(l, val) {
  if ( _.includes(l, val) ) return;
  l.push(val)
}

function pull(l, val) {
  _.pull(l, val)
}

app.controller('TimelineController', function($scope, $rootScope, $routeParams, Beep, Tag, QueryString) {
  var filter = $scope.filter = {
    sources: a($routeParams.sources),
    withoutSources: a($routeParams.withoutSources),
    tags: a($routeParams.tags),
    withoutTags: a($routeParams.withoutTags),
    fromDate: dt($routeParams.fromDate),
    untilDate: dt($routeParams.untilDate)
  }

  $scope.reload = function() {
    Beep.findAll(filter).then(function(data) {
      $scope.beeps = data.rows

      $scope.summary = buildSummary(data.rows)

      var displayedSources = _.chain(data.rows).map('source').uniq().value()
      Tag.getCloud(displayedSources).then(function(rows) {
        $scope.tagCloud = rows
      })

    })
  }

  $scope.withSource = function(s) {
    set(filter.sources, s)
    pull(filter.withoutSources, s)
  }

  $scope.withoutSource = function(s) {
    set(filter.withoutSources, s)
    pull(filter.sources, s)
  }

  $scope.withTag = function(t) {
    set(filter.tags, t)
    pull(filter.withoutTags, t)
  }

  $scope.withoutTag = function(t) {
    set(filter.withoutTags, t)
    pull(filter.tags, t)
  }

  $scope.$watch('filter', function(newVal) {
    QueryString.sync(newVal)
    $scope.reload()
  }, true)
})

function sorter(obj) {
  return _.chain(obj).pairs().map(function(p) {
    return {name: p[0], count: p[1]}
  }).sortBy('count').reverse().value()
}

function buildSummary(rows) {
  var sources = {},
      tags = {}

  rows.forEach(function(b) {
    sources[b.source] = (sources[b.source] || 0) + 1
    b.tags.forEach(function(t) {
      tags[t] = (tags[t] || 0) + 1
    })
  })

  var summary = {
    sources: sorter(sources),
    tags: sorter(tags)
  }

  return summary
}
