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

app.controller('SubsMenuCtrl', function($scope, $rootScope, WhoAmI, QueryString) {
  $scope.reload = function() {
    WhoAmI.get().then(function(acc) { $scope.subs = acc.subscriptions })
  }

  $scope.reload()

  var unbind = $rootScope.$on('subs-changed', $scope.reload)
  $scope.$on('destroy', unbind)

  $scope.paramify = QueryString.paramify
})

app.controller('SubsListCtrl', function($scope, WhoAmI, Account, Toaster, $modal) {
  WhoAmI.get().then(function(acc) {
    $scope.account = acc
    $scope.subs = acc.subscriptions
  })

  $scope.openEditModal = function(sub) {
    $modal.open({
      templateUrl: 'subscriptions/edit-modal.html',
      resolve: { sub: function() { return sub }},
      controller: function($scope, sub) {
        $scope.sub = _.clone(sub)
      }
    }).result.then(function(newSub) {
      _.assign(sub, newSub)
    })
  }

  $scope.save = function() {
    Toaster.follow(function() {
      return Account.save($scope.account).then(function() {
        return 'Saved successfully'
      })
    })
  }
})
