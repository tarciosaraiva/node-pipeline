'use strict';

var fs = require('fs');
var microtime = require('microtime');

function LedStripe() {
  this.spiDevice = '/dev/spidev0.0';
  this.numLEDs = 23;
  this.spiFd = null; //filedescriptor for spidevice
  this.gamma = 2.5;
  this.gammatable = new Array(256);
  this.bytePerPixel = 3; //RGB
  this.rowResetTime = 1000; // number of us CLK has to be pulled low (=no writes) for frame reset
  //required for save WS2801 reset
  this.sendRgbBuf = null; //function for writing to stripe, depends on stripe type
  this.isOpen = false;
}

LedStripe.prototype = {

  /*
   * connect to SPI port
   */
  connect: function (numLEDs, spiDevice, gamma) {
    // reset some stuff
    this.gammatable = new Array(256);

    // sanity check for params
    if ((numLEDs !== parseInt(numLEDs)) || (numLEDs < 1)) {
      console.error('invalid param for number of LEDs, plz use integer >0');
      return false;
    }
    if (spiDevice) {
      this.spiDevice = spiDevice;
    }
    // connect synchronously
    try {
      this.spiFd = fs.openSync(this.spiDevice, 'w');
      this.isOpen = true;
    } catch (err) {
      console.error('error opening SPI device: ' + this.spiDevice, err);
    }
    this.sendRgbBuf = ;
    this.numLEDs = numLEDs;
    this.gamma = gamma ? gamma : 2.5; //set gamma correction value
    // compute gamma correction table
    for (var i = 0; i < 256; i++) {
      this.gammatable[i] = Math.round(255 * Math.pow(i / 255, this.gamma));
    }
    //console.log("gammatable" + this.gammatable);
  },

  /*
   * disconnect from SPI port
   */
  disconnect: function () {
    if (this.spiFd) {
      fs.closeSync(this.spiFd);
      this.isOpen = false;
      this.spiFd = null;
    }
  },

  isBufferOpen: function() {
    return this.isOpen;
  },

  sendRgbBufLPD8806: function (buffer) {
    var bufSize = this.numLEDs * this.bytePerPixel,
      i = 0;

    if (buffer.length !== bufSize) {
      console.log('buffer length (' + buffer.lenght + ' byte) does not match LED stripe size (' +
        this.numLEDs + ' LEDs x ' + this.bytePerPixel + ' colors)');
      return;
    } // end if (buffer.length != bufSize)
    if (this.spiFd) {
      var numLeadingZeros = Math.ceil(this.numLEDs / 32); //number of zeros to "reset" LPD8806 stripe
      // mind the last zero byte for latching the last blue LED
      var aBuf = new Buffer(numLeadingZeros + bufSize + 1);
      // prime the stripe with zeros
      for (i = 0; i < numLeadingZeros; i++) {
        aBuf[i] = 0x00;
      }
      // transform color values
      for (i = 0; i < (bufSize); i += 3) {
        var r = (this.gammatable[buffer[i + 0]] >> 1) + 0x80;
        var g = (this.gammatable[buffer[i + 1]] >> 1) + 0x80;
        var b = (this.gammatable[buffer[i + 2]] >> 1) + 0x80;
        aBuf[i + numLeadingZeros + 0] = g;
        aBuf[i + numLeadingZeros + 1] = r;
        aBuf[i + numLeadingZeros + 2] = b;
      }
      // trailing zero
      aBuf[bufSize + numLeadingZeros] = 0x00;
      fs.writeSync(this.spiFd, aBuf, 0, aBuf.length, null);
    } //end if (this.spiFd)
  }, // end sendRgbBufLPD8806


  /*
   * fill whole stripe with one color
   */
  fill: function (r, g, b) {
    if (this.spiFd) {
      var bufSize = this.numLEDs * this.bytePerPixel;
      var aBuf = new Buffer(bufSize);
      for (var i = 0; i < (bufSize); i += 3) {
        aBuf[i + 0] = r;
        aBuf[i + 1] = g;
        aBuf[i + 2] = b;
      }
      this.sendRgbBuf(aBuf);
    }
  } //end fill
};

module.exports = new LedStripe();