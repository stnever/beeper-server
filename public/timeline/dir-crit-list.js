var app = angular.module('BeeperWeb'),
    utils = require('../services/utils')

app.directive('critList', function() {
  return {
    restrict: 'E',
    template: `
      <div class="filter-item all" ng-if="crit.all">
        <span class="filter-label">ALL</span>
      </div>

      <div class="filter-item source"
        ng-repeat="s in crit.sources">
        <span class="filter-label">{{s}}</span>
      </div>

      <div class="filter-item source"
        ng-repeat="s in crit.withoutSources">
        <span class="filter-label">not: {{s}}</span>
      </div>

      <div class="filter-item tag"
        ng-repeat="t in crit.tags">
        <span class="filter-label">{{t}}</span>
      </div>

      <div class="filter-item tag"
        ng-repeat="t in crit.withoutTags">
        <span class="filter-label">not: {{t}}</span>
      </div>
    `,
    scope: {
      crit: '='
    }
  }
})
