'use strict';

app.controller('PipelineCtrl', function ($scope, $http) {
  var DEFAULT_LENGTH = 1;
  var DEFAULT_OFFSET = 0;

  $scope.pipelines = [{
    name: 'Pipeline 1',
    stages: [{
      name: 'Stage 1',
      length: DEFAULT_LENGTH,
      offset: 0,
    }]
  }];

  $scope.addPipeline = function () {
    var pplns = $scope.pipelines.length + 1;
    $scope.pipelines.push({
      name: 'Pipeline ' + pplns,
      stages: []
    });
  };

  $scope.addStage = function () {
    var slen = this.p.stages.length,
      offset = slen !== 0 ? this.p.stages.map(function (el) {
        return parseInt(el.offset) + parseInt(el.length);
      }).reduce(function (pV, cV) {
        return cV;
      }) : DEFAULT_OFFSET;

    this.p.stages.push({
      name: 'Stage ' + parseInt(Math.random() * (10 - 1) + 1),
      offset: offset,
      length: DEFAULT_LENGTH
    });
  };

});