/* global angular: true */
'use strict';

var app = angular.module('pipeline', ['ngResource', 'flow', 'colorpicker.module']);
app.config(['flowFactoryProvider',
  function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
      target: '/api/sounds/upload',
      permanentErrors: [404, 500, 501],
      testChunks: false,
      simultaneousUploads: 1
    };
  }
]);