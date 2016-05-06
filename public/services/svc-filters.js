var _ = require('lodash')

module.exports = angular.module('BeeperWeb');

module.exports
  .filter('ifBlank', function () {
    return function(o, defVal) {
      if (o == null) return defVal;
      if (o.toString() == "") return defVal;
      return o;
    };
  })
  .filter('moment', function() {
    return function(date, fmt) {
      if ( date == null ) return "-";
      return moment(date).format(fmt);
    }
  })
  .filter('json', function() {
    return function(o) { return JSON.stringify(o) }
  })
  .filter('prettyJson', function() {
    return function(o) { return JSON.stringify(o, null, ' ') }
  })
  .filter('trusted', ['$sce', function($sce) {
    return function(text) {
      return $sce.trustAsHtml(text)
    }
  }])
  .run(function($rootScope) {
    $rootScope.len = function(obj) {
      if ( obj == null ) return 0;
      if ( _.isString(obj) ) return obj.trim().length;
      if ( _.isArray(obj) ) return obj.length;
      return 0;
    }
  })
