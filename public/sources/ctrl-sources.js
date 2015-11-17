var utils = require('../services/utils'),
    app = module.exports = angular.module('hrCards', [])

app.config(function($routeProvider) {
  $routeProvider
    .when('/sources', {
      templateUrl: 'sources/sources.html',
      controller: 'SourcesController'
    })
    .when('/sources/edit/:name*', {
      templateUrl: 'sources/edit-source.html',
      controller: 'EditSourceController'
    })
    .when('/sources/:name*', {
      templateUrl: 'sources/timeline.html',
      controller: 'SourceTimelineController'
    })
  }
)

app.controller('SourcesController', function($scope, Source) {
  $scope.reload = function() {
    return Source.findAll({sort: 'name asc'}).then(function(rows) {
      $scope.sources = rows;
    })
  }

  $scope.reload();
})

app.controller('SourceTimelineController', function($scope, $routeParams, Beep, Source, ConfirmDialog, $location) {
  $scope.reload = function() {
    Source.findAll({name: $routeParams.name}).then(function(rows) {
      $scope.source = rows[0];
    })

    Beep.findAll({source: $routeParams.name, sort: 'timestamp desc'}).then(function(rows) {
      $scope.days = utils.groupByDay(rows);
      // $scope.beeps = rows;
    })
  }

  $scope.reload();

  $scope.confirmDelete = function(obj) {
    ConfirmDialog({
      title: 'Confirm Delete',
      message: 'Do you really want to delete the source <b>{{name}}</b>? ' +
        'This will also delete all beeps associated with it. This ' +
        'action cannot be undone.',
      data: obj,
      textOk: 'Yes, delete',
      textCancel: 'No, do not delete'
    }).then(function() {
      return Source.delete(obj)
    }).then(function() {
      $location.path('/sources')
    });
  }

})

app.controller('EditSourceController', function($scope, $routeParams, Source, ConfirmDialog, $location) {
  var name = $routeParams.name;
  $scope.isCreate = (name == 'new');

  if ( $scope.isCreate ) {
    $scope.source = {}
  } else {
    Source.find($routeParams.name).then(function(row) {
      $scope.source = row;
    })
  }

  $scope.save = function() {
    Source.save($scope.source).then(function() {
      $location.path('/sources/' + $scope.source.name);
    })
  }

  $scope.confirmDelete = function(obj) {
    ConfirmDialog({
      title: 'Confirm Delete',
      message: 'Do you really want to delete the source <b>{{name}}</b>? ' +
        'This will also delete all beeps associated with it. This ' +
        'action cannot be undone.',
      data: obj,
      textOk: 'Yes, delete',
      textCancel: 'No, do not delete'
    }).then(function() {
      return Source.delete(obj)
    }).then(function() {
      $location.path('/sources')
    });
  }
})