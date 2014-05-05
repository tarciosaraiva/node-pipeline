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
    LED_STRIP = config.get('leds:length');

  ledstrip.connect(LED_STRIP);
  ledstrip.test(start, end);

  res.send();
});

router.post('/animate', function (req, res) {
  var anim = req.param('animation'),
    colour = hexToRgb(req.param('colour')),
    speed = Number(req.param('speed')),
    LED_STRIP = config.get('leds:length');

  ledstrip.connect(LED_STRIP);
  ledstrip.animate(anim, new Buffer(LED_STRIP * 3), {
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