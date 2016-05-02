var utils = require('../services/utils'),
    app = module.exports = angular.module('BeeperWeb')

app.config(function($routeProvider) {
  $routeProvider
    .when('/my-account', {
      templateUrl: 'my-account/my-account.html',
      controller: 'MyAccountCtrl'
    })
  }
)

app.controller('AccountMenuCtrl', function($scope, $http, $window) {
  $http.get('api/oauth/whoami').then(function(res) {
    $scope.me = res.data
  })

  $scope.doLogout = function() {
    // we can remove the token first, because the auth-interceptor
    // has a copy. afterwards, even if the logout was unsuccessful
    // for any reason, we won't have the old token anymore.
    localStorage.removeItem('beeper_web_token')
    $http.post('api/oauth/logout').then(function() {
      $window.location.href = '/login.html'
    })
  }
})
