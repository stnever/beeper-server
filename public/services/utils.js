exports.groupByDay = function(items) {
  items = items || []
  var result = [];
  items.forEach(function(i) {
    var last = _.last(result);
    if ( last == null || !exports.isSame(i.timestamp, last.timestamp) ) {
      last = {timestamp: i.timestamp, items: [i]}
      result.push(last);
    } else {
      last.items.push(i)
    }
  })
  return result;
}

exports.isSame = function(a, b) {
  return moment(a).utcOffset('-03:00')
    .isSame(moment(b).utcOffset('-03:00'), 'day');
}

exports.addRoute = function(app, route, template, controller) {
  return app.config(function($routeProvider) {
    $routeProvider.when(route, {
      template: template,
      controller: controller
    })
  })
}

exports.storeIn = function($scope, prop) {
  return function(obj) {
    $scope[prop] = obj
  }
}
