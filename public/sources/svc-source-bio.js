var app = angular.module('BeeperWeb')

app.directive('sourceBio', function() {
  return {
    restrict: 'E',
    template: `
      <div class="thumbnail">
        <img src="http://placehold.it/256">
      </div>

      <div>
        <h3>{{source.name}}</h3>
        <p>{{source.description}}</p>
        <p>
          <a href="#/sources/edit/{{source.name}}" class="btn btn-primary">Edit</a>
        </p>
      </div>
    `,
    scope: {
      source: '='
    }
  }
})