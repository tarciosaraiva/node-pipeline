'use strict';

app.controller('MainCtrl', function ($scope, $http) {
  $scope.stripeLength = 24;
  $scope.building = {
    animation: 'rainbow',
    colour: '#0000ff',
    speed: 100
  };
  $scope.executeTest = function () {
    $http.post('/leds/test', {
      length: $scope.stripeLength
    });
  };

  $scope.animate = function () {
    $http.post('/leds/animate', $scope.building)
  };
});