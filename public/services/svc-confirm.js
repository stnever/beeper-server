var app = module.exports = angular.module('BeeperWeb')

app.factory('ConfirmDialog', function($modal, $interpolate) {
  return function(opts) {
    opts.message = $interpolate(opts.message)(opts.data);
    _.defaults(opts, {
      textOk: 'OK', textCancel: 'Cancel'
    })

    return $modal.open({
      template:
        '<div class="modal-body">' +
        '  <h4 class="message">' + opts.title + '</h4>' +
        '  <p class="details">' + opts.message + '</p>' +
        '</div>' +
        '<div class="modal-footer">' +
        ' <button class="btn btn-default" ng-click="$dismiss()">' + opts.textCancel + '</button>' +
        ' <button class="btn btn-primary" ng-click="$close(true)">' + opts.textOk + '</button>' +
        '</div>'
    }).result;
  };
});