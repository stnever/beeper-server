var app = module.exports = angular.module('hrCards', [])

app.config(function($routeProvider) {
  $routeProvider
    .when('/sources', {
      templateUrl: 'sources/sources.html',
      controller: 'SourcesController'
    })
    .when('/sources/:name*', {
      templateUrl: 'sources/timeline.html',
      controller: 'SourceTimelineController'
    })
  }
)

app.controller('SourcesController', function($scope, Source) {
  Source.findAll().then(function(rows) {
    $scope.sources = rows;
  })


})

app.controller('SourceTimelineController', function($scope, $routeParams, Beep, Source) {

  Source.findAll({name: $routeParams.name}).then(function(rows) {
    $scope.source = rows[0];
  })

  Beep.findAll({source: $routeParams.name}).then(function(rows) {
    $scope.beeps = rows;
  })
})