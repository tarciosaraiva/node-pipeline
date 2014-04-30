'use strict';

app.controller('PipelineCtrl', function ($scope, $http) {
  $scope.pipelines = [{
    name: 'Pipeline 1',
    stages: [{
      name: 'Stage 1',
      offset: 0,
      length: 4
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
      offset = this.p.stages.map(function (el) {
        return parseInt(el.offset) + parseInt(el.length);
      }).reduce(function (pV, cV) {
        return cV;
      });

    this.p.stages.push({
      name: 'Stage ' + Math.random() * (10 - 1) + 1,
      offset: offset,
      length: 4
    });
  };

});