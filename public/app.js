var deps = ['ngRoute', 'ui.bootstrap',
  'ngFileUpload']

// Declare the main module
var app = angular.module('BeeperWeb', deps)

// Require all ctrl-* and svc-* files. Each of them adds
// something to the main module.
var bulk = require('bulk-require')
var components = bulk(__dirname, [
  '**/ctrl-*.js',
  '**/svc-*.js',
  '**/dir-*.js'
])

// Adds the default starting point
app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/login', {})
    .otherwise({redirectTo: '/sources'});
})
