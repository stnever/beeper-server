var _ = require('lodash'),
    app = module.exports = angular.module('authInterceptor', [])

app.run(function($http) {
  $http.defaults.headers.common.access_token =
    localStorage.getItem('beeper_web_token')
})

app.factory('authInterceptor', function($q, $location,
  $injector, $window) {

  return {
    response: function(response){
      if (response.status === 401) {
        console.log('Response 401, isError? %s',
          _.isError(response))
      }
      return response || $q.when(response)
    },
    responseError: function(rejection) {
      if (rejection.status === 401) {
        console.log("Response Error 401", rejection)
        // $window.location.href = 'login.html'
      }
      return $q.reject(rejection);
    }
  }
})

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor')
})