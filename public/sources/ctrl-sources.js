var utils = require('../services/utils'),
    app = module.exports = angular.module('BeeperWeb')

app.config(function($routeProvider) {
  $routeProvider
    // .when('/sources', {
    //   templateUrl: 'sources/sources.html',
    //   controller: 'SourcesController'
    // })
    // .when('/sources/edit/:name*', {
    //   templateUrl: 'sources/edit-source.html',
    //   controller: 'EditSourceController'
    // })
    // .when('/sources/:name*', {
    //   templateUrl: 'sources/timeline.html',
    //   controller: 'SourceTimelineController'
    // })
  }
)

utils.addRoute(app, '/sources',
  `
    <a href="#/sources/edit/new" class="btn btn-large btn-primary">
      <span class="fa fa-fw fa-lg fa-plus"></span>
      Create a source
    </a>

    <br><br>

    <div class="list-group">
      <div ng-repeat="s in sources">
        <source-in-list source="s"></source-in-list>
      </div>
    </div>

    <div class="alert alert-info" ng-if="sources.length == 0">
      <h3>There are no sources in this Beeper yet.</h3>

      You can create a source using the button above. Alternatively,
      you can create a source automatically by posting a beep to it:

      <ul>
        <li>using the <code>beeper</code> utility</li>
        <li>using the <code>beeper-client</code> module in your code.</li>
      </ul>
    </div>
  `,
  function SourcesController($scope, Source) {
    $scope.reload = function() {
      return Source.findAll({sort: 'name asc'}).then(function(rows) {
        $scope.sources = rows;
      })
    }

    $scope.reload();
  }
)

utils.addRoute(app, '/sources/:name',
  `
    <div class="col-sm-4">
      <source-bio source="source"></source-bio>
    </div>
    <div class="col-sm-8">
      <beeps-list data="beeps"></beeps-list>
    </div>
  `,
  function SourcesController($scope, $routeParams, Source, Beep) {
    var sourceName = $routeParams.name,
        storeIn = utils.storeIn

    $scope.reload = function() {
      Source.find(sourceName).then(storeIn($scope, 'source'))
      Beep.findAll({source: sourceName, sort: 'timestamp desc'})
        .then(storeIn($scope, 'beeps'))
    }

    $scope.reload()
  }
)

app.controller('SourceTimelineController', function($scope, $routeParams, Beep, Source, ConfirmDialog, $location) {
  $scope.reload = function() {
    Source.findAll({name: $routeParams.name}).then(function(rows) {
      $scope.source = rows[0];
    })

    Beep.findAll({
      source: $routeParams.name, sort: 'timestamp desc'
    }).then(function(data) {
      $scope.days = utils.groupByDay(data.rows);
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
