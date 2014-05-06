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

function rainbow(ledstrip, buffer, speed) {
  var i = 0,
    angle = 0,
    animationTick = 0.005,
    ledDistance = 0.3;

  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      angle = (angle < Math.PI * 2) ? angle : angle - Math.PI * 2;
      for (i; i < buffer.length; i += 3) {
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

function knightRider(ledstrip, buffer, speed) {
  var i = 0,
    lit = 0,
    modifier = 1,
    invert = false;

  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      if (invert) {
        for (i = buffer.length; i > 0; i -= 3) {
          // red
          buffer[i] = (i === lit) ? 0xFF : 0x00;
          // green and blue
          buffer[i + 1] = 0x00;
          buffer[i + 2] = 0x00;
        }
      } else {
        for (i = 0; i < buffer.length; i += 3) {
          // red
          buffer[i] = (i === lit) ? 0xFF : 0x00;
          // green and blue
          buffer[i + 1] = 0x00;
          buffer[i + 2] = 0x00;
        }
      }

      ledstrip.sendRgbBuf(buffer);
      lit += (3 * modifier);

      if (lit >= buffer.length) {
        lit = buffer.length;
        modifier *= -1;
        invert = !invert;
      } else if (lit <= 0) {
        lit = 0;
        modifier *= -1;
        invert = !invert;
      }
    }
  }, speed);
}

function flash(ledstrip, buffer, speed, colour) {
  var onState = false;
  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      if (onState) {
        ledstrip.fill(0x00, 0x00, 0x00);
      } else {
        ledstrip.fill(colour.r, colour.g, colour.b);
      }
      onState = !onState;
    }
  }, speed);
}

function standard(ledstrip, buffer, speed, colour) {
  var i = 0,
    lit = 0;

  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      for (i = 0; i < buffer.length; i += 3) {
        // red
        buffer[i] = (lit === i) ? colour.r : 0x00;
        // green
        buffer[i + 1] = (lit === i) ? colour.g : 0x00;
        // blue
        buffer[i + 2] = (lit === i) ? colour.b : 0x00;
      }

      ledstrip.sendRgbBuf(buffer);
      lit += 3;
      if (lit >= buffer.length) {
        lit = 0;
      }
    }
  }, speed);
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
    this.sendRgbBuf = this.sendRgbBufLPD8806;
    this.numLEDs = numLEDs;
    this.gamma = gamma ? gamma : 2.5; //set gamma correction value
    // compute gamma correction table
    for (var i = 0; i < 256; i++) {
      this.gammatable[i] = Math.round(255 * Math.pow(i / 255, this.gamma));
    }
  },

  /*
   * disconnect from SPI port
   */
  disconnect: function () {
    if (this.spiFd) {
      this.fill(0x00, 0x00, 0x00);
      fs.closeSync(this.spiFd);
      this.isOpen = false;
      this.spiFd = null;
    }
  },

  isBufferOpen: function () {
    return this.isOpen;
  },

  sendRgbBufLPD8806: function (buffer) {
    var bufSize = this.numLEDs * this.bytePerPixel,
      i = 0;

    if (buffer.length !== bufSize) {
      console.log('buffer length (' + buffer.lenght + ' byte) does not match LED stripe size (' +
        this.numLEDs + ' LEDs x ' + this.bytePerPixel + ' colors)');
      return;
    }

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
    }
  },

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
  },

  animate: function (name, buffer, config) {
    var intervalId, self = this;

    if (anim === 'rainbow') {
      intervalId = rainbow(self, buffer, config.speed);
    } else if (anim === 'flashing') {
      intervalId = flash(self, buffer, config.speed, config.colour);
    } else if (anim === 'kinghtrider') {
      intervalId = knightRider(self, buffer, config.speed);
    } else {
      intervalId = standard(self, buffer, config.speed, config.colour);
    }

    setTimeout(function () {
      self.disconnect();
      clearInterval(intervalId);
    }, 5000);
  },

  test: function (start, end) {
    if (!start) {
      var self = this;
      this.fill(0xFF, 0x00, 0x00);
      setTimeout(function () {
        self.fill(0x00, 0xFF, 0x00);
      }, 1000);
      setTimeout(function () {
        self.fill(0x00, 0x00, 0xFF);
      }, 2000);
      setTimeout(function () {
        self.fill(0xFF, 0xFF, 0xFF);
      }, 3000);
      setTimeout(function () {
        self.disconnect();
      }, 4000);
    } else {
      var buff = new Buffer(this.numLEDs * this.bytePerPixel);
      for (var i = start; i < (end); i += 3) {
        aBuf[i + 0] = 0xFF;
        aBuf[i + 1] = 0x00;
        aBuf[i + 2] = 0x00;
      }
      this.sendRgbBuf(buff);
    }
  }
};

module.exports = new LedStripe();