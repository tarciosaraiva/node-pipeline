'use strict';

var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();
var config = require('./../lib/config');

router.post('/test', function (req, res) {
  var len = Number(req.param('length')),
    start = Number(req.param('start')),
    end = Number(req.param('end')),
    animation = req.param('animation'),
    speed = Number(req.param('speed')),
    colour = req.param('colour');

  ledstrip.connect(length);
  ledstrip.test({
    length: len,
    start: start,
    end: end,
    animation: animation,
    speed: speed,
    colour: colour
  });

  res.send();
});

router.get('/', function (req, res) {
  res.json(config.get('leds'));
});

router.put('/', function (req, res) {
  var payload = req.body;
  config.merge('leds', payload);
  config.save(function (err) {
    if (err) {
      res.send(500);
    }
  });
  res.json('Configuration saved successfully.');
});

module.exports = router;