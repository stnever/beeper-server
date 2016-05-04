var utils = require('../services/utils'),
    app = module.exports = angular.module('BeeperWeb')

app.config(function($routeProvider) {
  $routeProvider
    .when('/setup/accounts', {
      templateUrl: 'accounts/list.html',
      controller: 'AccountsCtrl'
    })
    .when('/setup/accounts/:code', {
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

app.controller('EditAccountCtrl', function($scope, Account, Toaster, $routeParams) {
  $scope.roles = ['root', 'human', 'system']

  var code = $routeParams.code

  if ( code == 'new' ) {
    $scope.isCreate = true
    $scope.account = {}
  } else {
    $scope.isCreate = false
    Account.find(code).then(function(acc) {
      $scope.account = acc
    })
  }

  $scope.save = function() {
    return Toaster.follow(function() {
      return Account.save($scope.account).then(function() {
        return('Salvo com sucesso')
      })
    })
  }

})
