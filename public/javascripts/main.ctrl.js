'use strict';

app.controller('MainCtrl', function ($scope, $http) {
  $scope.executeTest = function () {
    $http.get('/led/test');
  };
});