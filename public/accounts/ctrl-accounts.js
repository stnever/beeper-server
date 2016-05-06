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

app.controller('EditAccountCtrl', function($scope, Account, Toaster, $routeParams, $modal, $location) {
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

  $scope.confirmDelete = function() {
    $modal.open({
      template: `
        <div class="modal-header">
          <button type="button" class="close" ng-click="$dismiss()">&times;</button>
          <h3 class="modal-title">Confirm Delete</h3>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to delete the <code>${code}</code> account?</p>
          <p>This action cannot be undone.</p>
        </div>

        <div class="modal-footer text-right">
          <button class="btn btn-default" ng-click="$dismiss()">No, don't delete</button>
          <button class="btn btn-danger" ng-click="$close(true)">Yes, delete it</button>
        </div>
      `
    }).result.then(function(confirmed) {
      if ( !confirmed ) return
      Toaster.follow(function() {
        return Account.delete(code).then(function() {
          $location.path('/accounts')
          return 'Deleted successfully'
        })
      })
    })
  }


  $scope.save = function() {
    return Toaster.follow(function() {
      return Account.save($scope.account).then(function() {
        return('Saved successfully')
      })
    })
  }

})
