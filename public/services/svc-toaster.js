var _ = require('lodash'),
    app = module.exports = angular.module('BeeperWeb');

app.directive('toaster', function() {
  return {
    restrict: 'E',
    template: [
      '<div id="toast" class="ng-cloak">',
      '  <div class="ts-coin" ng-class="{on: toast.showLoading}" ng-if="toast.coinExists">',
      '    <div class="loading"></div>',
      '  </div>',
      '  <div class="ts-message" ng-class="{on: toast.showMessage}">',
      '    <p class="text-center">{{toast.message}}</p>',
      '    <span class="close fa fa-times" ng-if="toast.showClose" ng-click="close()"></span>',
      '  </div>',
      '  <div class="ts-error" ng-class="{on: toast.showError}">',
      '    <p class="text-center">Ocorreu um erro durante esta operação:</p>',
      '    <span class="close fa fa-times" ng-if="toast.showClose" ng-click="close()"></span>',
      '    <p>{{toast.error.message}}</p>',
      '    <p class="pre" ng-if="toast.error.details != null">{{toast.error.details}}</p>',
      '  </div>',
      '</div>'
    ].join(''),
    controller: function($scope, Toaster) {
      $scope.close = function() {
        Toaster.hideAll()
      }
    }
  }
})

app.factory('Toaster', function($rootScope, $timeout, $q) {
  // Singleton no rootScope
  var toast = $rootScope.toast = {
    showLoading: false,
    showMessage: false,
    showError: false,
    message: null
  }

  var noop = function() {}

  function start() {
    // TODO talvez esconder um toast antigo, e esperar a
    // animação de saída acabar

    // NB: Esta flag tem o propósito de controlar se a coin
    // existe na DOM (para não gastar ciclos computando a
    // animação de um loader invisível)
    toast.coinExists = true

    // NB se inserirmos já com a classe "on", ela não anima.
    // vamos esperar 20ms antes de iniciar.
    return $timeout(function() {
      _.assign(toast, {
        showLoading: true, showMessage: false,
        showError: false, showClose: false, message: null})
    }, 20)
  }

  function hideLoading() {
    // Se o loading não está ativo, retorna agora.
    if ( !toast.showLoading ) return $q.when()

    // Se está loading, esconde, espera a anim acabar,
    // remove a coin da DOM e retorna.
    toast.showLoading = false
    return $timeout(noop, 400).then(function() {
      toast.coinExists = false
    })
  }

  function hideError() {
    // Se o loading não está ativo, retorna agora.
    if ( !toast.showError ) return $q.when()

    // Se está loading, esconde, espera a anim acabar e retorna.
    toast.showError = false
    return $timeout(noop, 400).then(function() {
      toast.error = null
    })
  }

  function hideMessage() {
    // Se o loading não está ativo, retorna agora.
    if ( !toast.showMessage ) return $q.when()

    // Se está loading, esconde, espera a anim acabar e retorna.
    toast.showMessage = false
    return $timeout(noop, 400).then(function() {
      toast.message = null
    })
  }

  function hideAll() {
    return $q.all([
      hideLoading(),
      hideMessage(),
      hideError()
    ])
  }

  function success(opts) {
    if ( _.isString(opts) ) {
      opts = {message: opts}
    }

    opts.message = opts.message || 'Salvo com sucesso'

    if ( opts.autoclose == null )
      opts.autoclose = true

    return $q.all([hideLoading(), hideError()]).then(function() {
      toast.message = opts.message
      toast.showMessage = true
      toast.showClose = false

      if ( !opts.autoclose ) {
        toast.showClose = true
        return;
      }

      return $timeout(noop, 2000).then(function() {
        return hideMessage()
      })
    })
  }

  function error(reason) {
    if ( reason.status ) {
      toast.error = {
        message: 'HTTP ' + reason.status,
        details: _.isString(reason.data)
          ? reason.data : JSON.stringify(reason.data)
      }
    }

    else if ( _.isError(reason) ) {
      toast.error = {
        message: reason.name + ' ' + reason.message
      }
    }

    else if ( _.isString(reason) ) {
      toast.error = {message: reason}
    }

    else {
      toast.error = {message: 'Erro desconhecido'}
    }

    return $q.all([hideLoading(), hideMessage()]).then(function() {
      toast.showError = true
      toast.showClose = true
    })
  }

  function follow(fn /* function or promise */) {
    start()

    return $q.when().then(function() {
      if ( !_.isFunction(fn) )
        return fn

      return fn()
    }).then(function(result) {
      return success(result)
    }).catch(function(err) {
      return error(err)
    })
  }

  function wait(fn /* function or promise */) {
    start()

    return $q.when().then(function() {
      if ( !_.isFunction(fn) )
        return fn

      return fn()
    }).then(function(result) {
      return hideAll()
    }).catch(function(err) {
      return error(err)
    })
  }

  return {
    start: start,
    success: success,
    error: error,
    hideAll: hideAll,
    follow: follow,
    wait: wait
  }
})
