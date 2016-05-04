var _ = require('lodash'),
    app = module.exports = angular.module('BeeperWeb');

app.directive('toggle', function() {
  return {
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    replace: true,
    template: [
      '<a href ng-click="toggle()">',
      '  <span class="fa fa-lg fa-fw {{icon()}}"></span>',
      '  <span ng-transclude></span>',
      '</a>'
    ].join(''),
    scope: {},
    link: function(scope, element, attrs, ngModelCtrl) {
      scope.ngModelCtrl = ngModelCtrl
    },
    controller: function($scope) {
      function getVal() {
        if ( $scope.ngModelCtrl )
          return $scope.ngModelCtrl.$modelValue || false;
        return false;
      }

      function setVal(x) {
        $scope.ngModelCtrl.$setViewValue(x)
      }

      $scope.toggle = function() {
        setVal(!getVal())
        // ctrl.$render()
      }

      $scope.icon = function() {
        return getVal() ? 'fa-check-square' : 'fa-square-o'
      }
    }
  }
})
