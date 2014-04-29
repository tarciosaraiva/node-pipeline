'use strict';

var app = angular.module('pipeline', ['ngRoute', 'ngResource']).config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'MainCtrl'
    });
});

$(function () {
  [{
    name: '.colorpicker-s',
    defaultColor: '#00ff00'
  }, {
    name: '.colorpicker-f',
    defaultColor: '#ff0000'
  }, {
    name: '.colorpicker-a',
    defaultColor: '#ffffff'
  }, {
    name: '.colorpicker-u',
    defaultColor: '#ffff00'
  }, {
    name: '.colorpicker-anim',
    defaultColor: '#0000ff'
  }].forEach(function (el) {
    $(el.name).colorpicker({
      color: el.defaultColor
    });
  });
});