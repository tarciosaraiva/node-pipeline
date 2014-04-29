var express = require('express');
var ledstripe = require('ledstripe');
var router = express.Router();

/* GET users listing. */
router.post('/test', function (req, res) {
  // everything possibly sane
  var numLEDs = Number(req.param('length')),
    myStripeType = 'LPD8806',
    mySpiDevice = '/dev/spidev0.0';

  // connecting to SPI
  ledstripe.connect(numLEDs, myStripeType, mySpiDevice);

  // do some fancy stuff
  ledstripe.fill(0xFF, 0x00, 0x00);
  setTimeout(function () {
    ledstripe.fill(0x00, 0xFF, 0x00);
  }, 2000);
  setTimeout(function () {
    ledstripe.fill(0x00, 0x00, 0xFF);
  }, 4000);
  setTimeout(function () {
    ledstripe.fill(0xFF, 0xFF, 0xFF);
  }, 6000);
  setTimeout(function () {
    ledstripe.fill(0x00, 0x00, 0x00);
    ledstripe.disconnect();
  }, 8000);

  res.send();
});

router.post('/animate', function (req, res) {
  var anim = req.param('animation'),
    colour = req.param('colour'),
    speed = req.param('speed');

  var numLEDs = 24,
    myStripeType = 'LPD8806',
    mySpiDevice = '/dev/spidev0.0';

  // connecting to SPI
  ledstripe.connect(numLEDs, myStripeType, mySpiDevice);

  // o.k., lets do some colorful animation
  var myDisplayBuffer = new Buffer(numLEDs * 3);
  var animationTick = 0.005;
  var angle = 0;
  var ledDistance = 0.3;
  setInterval(function () {
    angle = (angle < Math.PI * 2) ? angle : angle - Math.PI * 2;
    for (var i = 0; i < myDisplayBuffer.length; i += 3) {
      //red
      myDisplayBuffer[i] = 128 + Math.sin(angle + (i / 3) * ledDistance) * 128;
      //green
      myDisplayBuffer[i + 1] = 128 + Math.sin(angle * -5 + (i / 3) * ledDistance) * 128;
      //blue
      myDisplayBuffer[i + 2] = 128 + Math.sin(angle * 7 + (i / 3) * ledDistance) * 128;
    }
    ledstripe.sendRgbBuf(myDisplayBuffer);
    angle += animationTick;
  }, speed);

  res.send();
});

module.exports = router;