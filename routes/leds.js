var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();

function disconnectLed() {
  ledstrip.fill(0x00, 0x00, 0x00);
  ledstrip.disconnect();
}

function rainbow(buffer, speed) {
  var animationTick = 0.005;
  var angle = 0;
  var ledDistance = 0.3;

  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      angle = (angle < Math.PI * 2) ? angle : angle - Math.PI * 2;
      for (var i = 0; i < buffer.length; i += 3) {
        //red
        buffer[i] = 128 + Math.sin(angle + (i / 3) * ledDistance) * 128;
        //green
        buffer[i + 1] = 128 + Math.sin(angle * -5 + (i / 3) * ledDistance) * 128;
        //blue
        buffer[i + 2] = 128 + Math.sin(angle * 7 + (i / 3) * ledDistance) * 128;
      }
      ledstrip.sendRgbBuf(buffer);
      angle += animationTick;
    }
  }, speed);
}

function knightRider(buffer, speed) {
  var ledDistance = 0.3, whatever = 128, color;

  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      for (var i = 0; i < buffer.length; i += 3) {
        // red
        color = 128 + ((i / 3) * ledDistance) * whatever;
        buffer[i] = color;
        // green and blue
        buffer[i + 1] = 0x00;
        buffer[i + 2] = 0x00;
      }
      ledstrip.sendRgbBuf(buffer);
      if (color >= 255) {
        whatever = whatever * -1;
      }
    }
  }, speed);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function flash(buffer, speed, colour) {
  var rgb = hexToRgb(colour),
    onState = false;
  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      if (onState) {
        ledstrip.fill(0x00, 0x00, 0x00);
      } else {
        ledstrip.fill(rgb.r, rgb.g, rgb.b);
      }
      onState = !onState;
    }
  }, speed);
}

function standard(buffer, speed, colour) {
  return flash(buffer, speed, colour);
}

/* GET users listing. */
router.post('/test', function (req, res) {
  var numLEDs = Number(req.param('length'));

  ledstrip.connect(numLEDs);

  // do some fancy stuff
  ledstrip.fill(0xFF, 0x00, 0x00);
  setTimeout(function () {
    ledstrip.fill(0x00, 0xFF, 0x00);
  }, 1000);
  setTimeout(function () {
    ledstrip.fill(0x00, 0x00, 0xFF);
  }, 2000);
  setTimeout(function () {
    ledstrip.fill(0xFF, 0xFF, 0xFF);
  }, 3000);
  setTimeout(function () {
    disconnectLed();
  }, 4000);

  res.send();
});

router.post('/animate', function (req, res) {
  var anim = req.param('animation'),
    colour = req.param('colour'),
    speed = Number(req.param('speed')),
    numLEDs = 24,
    intervalId;

  // connecting to SPI
  ledstrip.connect(numLEDs);
  var myDisplayBuffer = new Buffer(numLEDs * 3);

  if (anim === 'rainbow') {
    intervalId = rainbow(myDisplayBuffer, speed);
  } else if (anim === 'flash') {
    intervalId = flash(myDisplayBuffer, speed, colour);
  } else if (anim === 'kinghtrider') {
    intervalId = knightRider(new Buffer(3), speed);
  } else {
    intervalId = standard(myDisplayBuffer, speed, colour);
  }

  setTimeout(function () {
    disconnectLed();
    clearInterval(intervalId);
  }, 10000);

  res.send();
});

module.exports = router;