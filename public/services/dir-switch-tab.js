var app = module.exports = angular.module('BeeperWeb');

app.directive('switchTab', function () {
  return {
    link: function (scope, element, attrs) {
      element.click(function(e) {
          e.preventDefault();
          $(element).tab('show')
      })
    }
  }
})
