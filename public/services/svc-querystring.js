var _ = require('lodash'),
    moment = require('moment');

var app = module.exports = angular.module('BeeperWeb')

app.factory('QueryString', function($location) {

  function syncQueryString(obj) {
    _.forOwn(obj, function(v, k) {
      if ( _.isArray(v) && v.length >= 1)
        $location.search(k, v.join(','));
      else if ( _.isDate(v) )
        $location.search(k, moment(v).toISOString());
      else if ( v != null )
        $location.search(k,v);
      else
        $location.search(k, null)
    });
    $location.replace();
  }

  // Utilitário que produz uma query-string dado
  // um objeto (mas que não manipula o location)
  function paramify(obj) {
    return _.chain(obj).pairs().map(function(pair) {
      var v = pair[1];
      if ( _.isArray(v) && v.length > 0) v = v.join(',');
      if ( _.isDate(v) ) v = moment(v).toISOString();
      if ( v == null || v.length < 1 ) return null;
      return pair[0] + '=' + v;
    }).without(null).value().join('&');
  }

  return {
    sync: syncQueryString,
    paramify: paramify
  }
});
