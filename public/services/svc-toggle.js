var _ = require('lodash'),
    app = module.exports = angular.module('BeeperWeb');

app.directive('toggle', function() {
  return {
    restrict: 'E',
    require: 'ngModel',
    transclude: true,
    replace: true,
    template: [
      '<span>',
      ' <span class="fa fa-lg fa-fw {{icon()}}" ng-if="isReadonly"></span>',
      ' <a href ng-click="toggle()" ng-if="!isReadonly">',
      '  <span class="fa fa-lg fa-fw {{icon()}}"></span>',
      '  <span ng-transclude></span>',
      ' </a>',
      '</span>'
    ].join(''),
    scope: {},
    link: function($scope, element, attrs, ngModelCtrl) {

      $scope.isReadonly = (attrs.readonly == 'true')

      function getVal() {
        return ngModelCtrl.$modelValue || false
      }

      function setVal(x) {
        ngModelCtrl.$setViewValue(x)
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
