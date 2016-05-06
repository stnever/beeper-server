var _ = require('lodash'),
    app = module.exports = angular.module('BeeperWeb')

function s2a(s) {
  if ( s == null ) return []
  if ( _.isArray(s) ) return s
  return s.split(' ').map(function(p) { return p.trim() })
}

function rerunFormatters(ngModel) {
  if( !ngModel.$valid ) return;

  var viewValue = ngModel.$modelValue
  var formatters = ngModel.$formatters
  for ( var i = formatters.length - 1; i >= 0; --i ) {
    viewValue = formatters[i](viewValue)
  }

  ngModel.$viewValue = viewValue
  ngModel.$render()
}

// http://stackoverflow.com/questions/13420693/is-it-possible-to-transform-a-value-between-view-and-model-in-angularjs-for-inpu
app.directive('arrayInput', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {

      if ( !ngModel ) return

      ngModel.$parsers.push(function(value) {
        if ( !value ) return value;
        return s2a(value)
      })

      ngModel.$formatters.push(function(value) {
        if ( !value || !_.isArray(value) ) return value;
        return value.join(' ')
      })

      element.bind('blur', function() {
        rerunFormatters(ngModel)
      })
    }
  }
})
