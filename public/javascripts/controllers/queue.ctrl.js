/*global app: true */
'use strict';

app.controller('QueueCtrl', function ($scope, $http) {

  $scope.queue = {
    poll: 10,
    name: '',
    region: 'ap-southeast-2',
    accessKey: '',
    secretKey: ''
  };

  $scope.load = function () {
    $http.get('/api/queue').success(function (data) {
      $scope.queue = data;
    });
  };

  $scope.save = function () {
    $http.put('/api/queue', $scope.queue);
  };

  $scope.load();

});