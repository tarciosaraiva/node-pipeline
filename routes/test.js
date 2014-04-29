var express = require('express');
var ledstripe = require('ledstripe');
var router = express.Router();

/* GET users listing. */
router.get('/led/test', function (req, res) {
  // everything possibly sane
  var numLEDs = 24,
    myStripeType = 'LPD8806',
    mySpiDevice = '/dev/spidev0.0';

  // connecting to SPI
  myLedStripe.connect(numLEDs, myStripeType, mySpiDevice);

  // do some fancy stuff
  myLedStripe.fill(0xFF, 0x00, 0x00);
  console.log("red");
  setTimeout(function () {
    myLedStripe.fill(0x00, 0xFF, 0x00);
    console.log("green")
  }, 1000);
  setTimeout(function () {
    myLedStripe.fill(0x00, 0x00, 0xFF);
    console.log("blue")
  }, 2000);
  setTimeout(function () {
    myLedStripe.fill(0xFF, 0xFF, 0xFF);
    console.log("white")
  }, 3000);
  setTimeout(function () {
    myLedStripe.disconnect();
    process.exit()
  }, 4000);
});

module.exports = router;