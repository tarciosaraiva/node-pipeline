'use strict';

app.controller('PipelineCtrl', function ($scope, $rootScope, $http) {
  var DEFAULT_LENGTH = 10;
  var DEFAULT_OFFSET = 0;

  $scope.canAdd = true;
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
        return parseInt(el.offset, 10) + parseInt(el.length, 10);
      }).reduce(function (previousVal, currentVal) {
        return currentVal;
      }) : DEFAULT_OFFSET;

    if (offset >= $rootScope.stripLength) {
      offset = $rootScope.stripLength;
      $scope.canAdd = false;
    }

    this.p.stages.push({
      name: 'Stage ' + parseInt(Math.random() * (10 - 1) + 1, 10),
      length: Number(DEFAULT_LENGTH),
      offset: Number(offset)
    });
  };

  $scope.removeStage = function () {
    var pipeline = this.$parent.$index,
      stage = this.$index;
    $scope.pipelines[pipeline].stages.splice(stage, 1);
  };

  $scope.testPipeline = function () {
    var stages = this.p.stages,
      start = Number(stages[0].offset),
      end = start + (Number(stages[stages.length - 1].length) + Number(stages[stages.length - 1].offset));
    $http.post('/api/leds/test', {
      length: $rootScope.stripLength,
      start: start,
      end: end
    });
  };

  $scope.testStage = function () {
    var start = Number(this.s.offset),
      end = start + Number(this.s.length);
    $http.post('/api/leds/test', {
      length: $rootScope.stripLength,
      start: start,
      end: end
    });
  };

  $scope.load = function () {
    $http.get('/api/pipelines').success(function (data) {
      if (data.length > 0) {
        $scope.pipelines = data;
      }
    });
  };

  $scope.save = function () {
    $http.put('/api/pipelines', $scope.pipelines);
  };

  $scope.load();

});