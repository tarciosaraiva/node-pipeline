var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();
var config = require('./../lib/config');

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

router.post('/test', function (req, res) {
  var start = Number(req.param('start')),
    end = Number(req.param('end')),
    length = Number(req.param('length'));

  ledstrip.connect(length);
  ledstrip.test(start, end);

  res.send();
});

router.post('/animate', function (req, res) {
  var building = req.param('building'),
    length = Number(req.param('length'));

  ledstrip.connect(length);
  ledstrip.animate(
    building.animation,
    new Buffer(length * 3), {
      speed: Number(building.speed),
      colour: hexToRgb(building.colour)
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