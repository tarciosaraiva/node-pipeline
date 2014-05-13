/*global app: true */
'use strict';

app.controller('SoundsCtrl', function ($scope, $http) {
  $scope.sounds = {
    enableSounds: false,
    success: '',
    fail: '',
    abort: '',
    unstable: ''
  };

  $scope.updateSound = function (flowFile) {
    $scope.sounds[flowFile.sound] = flowFile.file.name;
  };

  $scope.$on('flow::fileAdded', function (event, $flow, flowFiles) {
    $scope.files += 1;
    if ($scope.files > 4) {
      event.preventDefault(); //prevent file from uploading
    }
  });

  $scope.load = function () {
    $http.get('/api/sounds').success(function (data) {
      if (data.length > 0) {
        $scope.sounds = data;
      }
    });
  };

  $scope.save = function () {
    $http.put('/api/sounds', $scope.sounds);
  };

});