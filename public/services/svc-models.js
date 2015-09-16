var app = module.exports = angular.module('bpModels', [])

function returnData(res) { return res.data }

app.factory('Model', function($http) {
  return function(endpoint) {
    return {
      findAll: function(params) {
        console.log(endpoint, params);
        return $http.get(endpoint, {params: params}).then(returnData)
      },
      find: function(id) {
        return $http.get(endpoint + '/' + id).then(returnData)
      },
      save: function(obj) {
        if ( obj.id == null )
          return $http.post(endpoint, obj).then(returnData);
        else
          return $http.put(endpoint + '/' + obj.id, obj)
            .then(returnData);
      },
      delete: function(obj) {
        var id = _.isNumber(obj) ? +obj : obj.id;
        return $http.delete(endpoint + '/' + id).then(returnData);
      }
    }
  }
});

app.factory('Source', function(Model) {
  return Model('api/sources');
});

app.factory('Channel', function(Model) {
  return Model('api/channels');
});

app.factory('Beep', function(Model) {
  return Model('api/beeps');
});
