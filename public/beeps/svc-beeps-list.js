var app = angular.module('BeeperWeb'),
    utils = require('../services/utils')

app.directive('beepsList', function() {
  return {
    restrict: 'E',
    template: `
      <div ng-repeat="day in days">
        <div class="day-header text-center text-muted">
          <span class="fa fa-level-down fa-flip-horizontal pull-left"></span>
          {{day.timestamp | moment:"MMMM DD, YYYY"}}
          <span class="fa fa-level-down pull-right"></span>
        </div>

        <div class="list-group">

          <div class="list-group-item" ng-repeat="b in day.items">
            <div class="media">
              <div class="media-left">
                <a href="#/sources/{{b.source}}">
                  <img class="media-object" src="http://placehold.it/64x64">
                </a>
              </div>
              <div class="media-body">
                <h4 class="list-group-item-heading">
                  <a href="#/sources/{{b.source}}">{{b.source}}</a>

                  <span class="text-muted">
                    {{b.timestamp | moment:'MMM DD, HH:mm:ss'}}
                  </span>
                </h4>
                <p class="list-group-item-text lead">
                  {{b.contents}}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `,
    scope: {
      data: '='
    },
    controller: function($scope) {
      $scope.$watch('data', function(newVal) {
        if ( newVal != null )
          $scope.days = utils.groupByDay(newVal)
      }, true)
    }
  }
})
