var express = require('express');
var ledstrip = require('./../lib/ledstrip');
var router = express.Router();

/* GET users listing. */
router.post('/test', function (req, res) {
  // everything possibly sane
  var numLEDs = Number(req.param('length')),
    mySpiDevice = '/dev/spidev0.0';

  // connecting to SPI
  ledstrip.connect(numLEDs, mySpiDevice);

  // do some fancy stuff
  ledstrip.fill(0xFF, 0x00, 0x00);
  setTimeout(function () {
    ledstrip.fill(0x00, 0xFF, 0x00);
  }, 2000);
  setTimeout(function () {
    ledstrip.fill(0x00, 0x00, 0xFF);
  }, 4000);
  setTimeout(function () {
    ledstrip.fill(0xFF, 0xFF, 0xFF);
  }, 6000);
  setTimeout(function () {
    ledstrip.fill(0x00, 0x00, 0x00);
    ledstrip.disconnect();
  }, 8000);

  res.send();
});

router.post('/animate', function (req, res) {
  var anim = req.param('animation'),
    colour = req.param('colour'),
    speed = Number(req.param('speed')),
    numLEDs = 24,
    mySpiDevice = '/dev/spidev0.0';

  // connecting to SPI
  ledstrip.connect(numLEDs, mySpiDevice);

  // o.k., lets do some colorful animation
  var myDisplayBuffer = new Buffer(numLEDs * 3);
  var animationTick = 0.005;
  var angle = 0;
  var ledDistance = 0.3;

  setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      angle = (angle < Math.PI * 2) ? angle : angle - Math.PI * 2;
      for (var i = 0; i < myDisplayBuffer.length; i += 3) {
        //red
        myDisplayBuffer[i] = 128 + Math.sin(angle + (i / 3) * ledDistance) * 128;
        //green
        myDisplayBuffer[i + 1] = 128 + Math.sin(angle * -5 + (i / 3) * ledDistance) * 128;
        //blue
        myDisplayBuffer[i + 2] = 128 + Math.sin(angle * 7 + (i / 3) * ledDistance) * 128;
      }
      ledstrip.sendRgbBuf(myDisplayBuffer);
      angle += animationTick;
    }
  }, speed);

  setTimeout(function () {
    ledstrip.fill(0x00, 0x00, 0x00);
    ledstrip.disconnect();
  }, 5000);

  res.send();
});

module.exports = router;