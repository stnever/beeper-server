var utils = require('../services/utils'),
    app = module.exports = angular.module('bpAccounts', [])

app.config(function($routeProvider) {
  $routeProvider
    .when('/setup/accounts', {
      templateUrl: 'accounts/list.html',
      controller: 'AccountsCtrl'
    })
    .when('/setup/accounts/:id', {
      templateUrl: 'accounts/edit.html',
      controller: 'EditAccountCtrl'
    })
  }
)

app.controller('AccountsCtrl', function($scope, Account) {
  Account.findAll().then(function(data) {
    $scope.accounts = data.rows
  })
})

app.controller('EditAccountCtrl', function($scope, Account) {
})