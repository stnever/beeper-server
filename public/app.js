var bulk = require('bulk-require');

// Apenas ctrl-* e svc-* serão lidos como módulos do Angular
var components = bulk(__dirname, [
  '**/ctrl-*.js',
  '**/svc-*.js'
]);

var depNames = ['ngRoute', 'ui.bootstrap', 'ngFileUpload', 'authInterceptor'];

function getModuleNames(root) {
  if ( root.name ) depNames.push(root.name);
  else Object.keys(root).forEach(function(key) {
    getModuleNames(root[key]);
  })
}

x=2;

getModuleNames(components);
console.log('all dependent modules', depNames);

// Inicializa a aplicação inteira
var app = angular.module('BeeperWeb', depNames)
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/login', {})
      .otherwise({redirectTo: '/sources'});
  })