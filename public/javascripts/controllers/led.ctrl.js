/*global app: true */
'use strict';

app.controller('LedCtrl', function ($scope, $rootScope, $http) {
  $rootScope.stripLength = 24;
  $scope.leds = {
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
      length: $rootScope.stripLength
    });
  };

  $scope.animate = function () {
    $http.post('/api/leds/animate', {
      length: $rootScope.stripLength,
      building: $scope.leds.building
    });
  };

  $scope.load = function () {
    $http.get('/api/leds').success(function (data) {
      $scope.leds = data;
      $rootScope.stripLength = data.length;
    });
  };

  $scope.save = function () {
    $scope.leds.length = $rootScope.stripLength;
    $http.put('/api/leds', $scope.leds);
  };

  $scope.load();

});