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

        <div class="list-group beeps-list">

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

                  <span class="beep-timestamp">
                  {{b.timestamp | moment:'HH:mm:ss'}}
                  </span>

                  <span class="beep-tags">
                    <span ng-repeat="t in b.tags">#{{t}} </span>
                  </span>

                </h4>
                <p class="list-group-item-text lead">
                  {{b.contents}}
                </p>

              </div>

              <div class="media-right media-middle">
                <a class="beep-details-link"
                  href="#/beeps/{{b._id}}"
                  ng-click="openDetailsModal(b); $event.preventDefault()">
                  <span class="fa fa-lg fa-chevron-right"></span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    `,
    scope: {
      data: '='
    },
    controller: function($scope, $modal) {
      $scope.$watch('data', function(newVal) {
        if ( newVal != null )
          $scope.days = utils.groupByDay(newVal)
      }, true)

      $scope.openDetailsModal = function(beep) {
        $modal.open({
          templateUrl: 'beeps/details-modal.html',
          size: 'lg',
          controller: function($scope) {
            $scope.beep = beep
          }
        })
      }
    }
  }
})
