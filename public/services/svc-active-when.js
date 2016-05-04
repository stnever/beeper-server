var app = module.exports = angular.module('BeeperWeb')

app.directive('activeWhen', ['$location', function($location) {
  var pathMatches = function(path, expression) {
    var regexp = new RegExp("^" + expression.replace(/\*/, ".*"));
    return path && regexp.test(path);
  }

  var hasQueryParam = function(queryParams, criteria) {
    if ( criteria[0] == '?' ) criteria = criteria.substring(1);
    var pieces = criteria.split('=');
    return queryParams[pieces[0]] == pieces[1];
  }

  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      var checkIfActive = function() {
        var criteria = attrs.activeWhen;
        var isQuery = criteria[0] == '?';
        var isActive = false;
        if ( isQuery ) {
          isActive = hasQueryParam($location.search(), criteria);
        } else {
          isActive = pathMatches($location.path(), criteria);
        }

        elem.toggleClass("active", isActive);
      }

      checkIfActive();
      scope.$on('$locationChangeSuccess', checkIfActive);
    }
  };
}])
