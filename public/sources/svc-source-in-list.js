var app = angular.module('BeeperWeb')

app.directive('sourceInList', function() {
  return {
    restrict: 'E',
    template: `
      <div class="list-group-item">
        <div class="media">
          <div class="media-left">
            <a href="#/sources/{{s.name}}">
              <img class="media-object" src="http://placehold.it/64x64">
            </a>
          </div>
          <div class="media-body">

            <div class="col-md-6">
              <h4 class="list-group-item-heading">
                <a href="#/sources/{{s.name}}">
                  {{s.name}}
                </a>
              </h4>
              {{s.description | ifBlank:'No description.'}}
            </div>

            <div class="col-md-6">
              <h4 class="list-group-item-heading">
                Latest message
                <span class="text-muted">
                  {{s.latestBeep.timestamp | moment:'MMM DD, HH:mm:ss'}}
                </span>
              </h4>
              {{s.latestBeep.contents}}
            </div>

          </div>
        </div>
      </div>
    `,
    scope: {
      s: '=source'
    }
  }
})
