module.exports = angular.module('filters', []);

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