var app = module.exports = angular.module('BeeperWeb'),
    _ = require('lodash'),
    moment = require('moment')

function returnData(res) { return res.data }

app.factory('paramsSerializer', function() {

  return {
    request: function(req) {
      if ( req.params ) {
        var newParams = _.mapValues(req.params, function(val, key) {
          if ( _.isArray(val) ) return val.join(',')
          if ( _.isDate(val) ) return moment(val).format('YYYY-MM-DDTHH:mm:ssZ')
          return val
        })

        req.params = newParams
      }

      return req
    }
  }
})

app.config(function($httpProvider) {
  $httpProvider.interceptors.push('paramsSerializer')
})

app.factory('Model', function($http) {
  return function(endpoint, idProperty) {
    return {
      getEndpoint: function() { return endpoint },
      getId: function(obj) { return obj[idProperty || 'id']},
      findAll: function(params) {
        console.log(endpoint, params);
        return $http.get(endpoint, {params: params}).then(returnData)
      },
      find: function(id) {
        return $http.get(endpoint + '/' + id).then(returnData)
      },
      create: function(obj) {
        return $http.post(endpoint, obj).then(returnData);
      },
      update: function(obj) {
        return $http.put(endpoint + '/' + this.getId(obj), obj)
          .then(returnData);
      },
      save: function(obj) {
        if ( this.getId(obj) == null ) return this.create(obj);
        else return this.update(obj);
      },
      delete: function(obj) {
        var id = _.isPlainObject(obj) ? this.getId(obj) : obj;
        return $http.delete(endpoint + '/' + id).then(returnData);
      }
    }
  }
});

app.factory('Source', function(Model, $http) {
  // sources are created/updated based on their name, not id.
  // Note that this means the "save()" method cannot really
  // distinguish between objects that exist or not (this is
  // intentional). In practice, save() will always update().
  var svc = Model('api/sources', 'name')
  return svc;
})

app.factory('Channel', function(Model) {
  return Model('api/channels')
})

app.factory('Account', function(Model) {
  return Model('api/accounts', 'code')
})

app.factory('Beep', function(Model) {
  return Model('api/beeps')
})

app.factory('Subscription', function($http) {
  return {
    create: function(account, sub) {
      return $http.post(`api/accounts/${account}/subscriptions`, sub)
        .then(returnData)
    }
  }
})

app.factory('Tag', function($http) {
  return {
    getCloud: function(sources) {
      return $http.get('api/tags', {params: {sources: sources}})
        .then(returnData)
    }
  }
})

app.factory('WhoAmI', function($http) {
  return {
    get: function() {
      return $http.get('api/oauth/whoami').then(returnData)
    }
  }
})
