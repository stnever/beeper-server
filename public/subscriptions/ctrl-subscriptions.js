var utils = require('../services/utils'),
    app = module.exports = angular.module('BeeperWeb')

app.config(function($routeProvider) {
  $routeProvider
    .when('/subscriptions', {
      templateUrl: 'subscriptions/list.html',
      controller: 'SubsListCtrl'
    })
  }
)

app.controller('SubsMenuCtrl', function($scope, WhoAmI, QueryString) {
  WhoAmI.get().then(function(user) {
    $scope.subs = user.subscriptions
  })

  $scope.paramify = QueryString.paramify
})

app.controller('SubsListCtrl', function($scope, WhoAmI, Account, Toaster) {
  WhoAmI.get().then(function(acc) {
    $scope.account = acc
    $scope.subs = acc.subscriptions
  })

  $scope.save = function() {
    Toaster.follow(function() {
      return Account.save($scope.account).then(function() {
        return 'Saved successfully'
      })
    })
  }
})
