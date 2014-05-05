/*global app: true */
'use strict';

app.controller('LedCtrl', function ($scope, $http) {
  $scope.leds = {
    length: 24,
    colours: {
      success: '#00FF00',
      fail: '#FF0000',
      abort: '#FFFFFF',
      unstable: '#FFFF00'
    },
    building: {
      animation: 'standard',
      colour: '#0000FF',
      speed: 25
    }
  };

  $scope.executeTest = function () {
    $http.post('/api/leds/test', {
      length: $scope.leds.length
    });
  };

  $scope.animate = function () {
    $http.post('/api/leds/animate', $scope.leds.building);
  };

  $scope.load = function () {
    $http.get('/api/leds').success(function (data) {
      $scope.leds = data;
    });
  };

  $scope.save = function () {
    $http.put('/api/leds', $scope.leds);
  };

  $scope.load();

});