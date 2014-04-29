var express = require('express');
var ledstripe = require('ledstripe');
var router = express.Router();

/* GET users listing. */
router.get('/test', function (req, res) {
  // everything possibly sane
  var numLEDs = 24,
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
  }, 2000);
  setTimeout(function () {
    ledstripe.fill(0xFF, 0xFF, 0xFF);
  }, 2000);
  setTimeout(function () {
    ledstripe.fill(0x00, 0x00, 0x00);
    ledstripe.disconnect();
  }, 2000);

  res.send();
});

module.exports = router;