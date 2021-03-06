'use strict';

var fs = require('fs');
var conf = require('./config');
var logger = require('./logger');
var h2r = require('./utils').hexToRgb;

// ************************************
// Animation functions     ************
// ************************************
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

function flashing(ledstrip, buffer, speed, colour) {
  var i, onState = false;
  return setInterval(function () {
    if (ledstrip.isBufferOpen()) {
      for (i = 0; i < buffer.length; i += 3) {
        // red
        buffer[i] = onState ? colour.r : 0x00;
        // green
        buffer[i + 1] = onState ? colour.g : 0x00;
        // blue
        buffer[i + 2] = onState ? colour.b : 0x00;
      }
      onState = !onState;
      ledstrip.sendRgbBuf(buffer);
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

// ************************************
// LEDStripe Object        ************
// ************************************
function LedStripe() {
  this.spiDevice = '/dev/spidev0.0';
  this.numLEDs = 32;
  this.sectionStart = 0;
  this.sectionEnd = 23;
  // filedescriptor for spidevice
  this.spiFd = null;
  this.gamma = 2.5;
  this.gammatable = new Array(256);
  // RGB
  this.bytePerPixel = 3;
  this.isOpen = false;
}

LedStripe.prototype = {

  /*
   * connect to SPI port
   */
  connect: function (sectionStart, sectionEnd, spiDevice, gamma) {
    logger.log('info', 'Connecting with strip @ "%s" for section [%d - %d]', spiDevice || this.spiDevice, sectionStart, sectionEnd);

    this.gammatable = new Array(256);
    this.numLEDs = parseInt(conf.get('leds:length'), 10);

    if (isNaN(this.sectionStart)) {
      this.sectionStart = 0;
    }

    if (isNaN(this.sectionEnd)) {
      this.sectionEnd = this.numLEDs;
    }

    this.sectionStart = parseInt(sectionStart, 10);
    this.sectionEnd = parseInt(sectionEnd, 10);

    if (this.sectionStart > this.sectionEnd) {
      return false;
    }

    if (this.sectionEnd > this.numLEDs) {
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
      logger.error('Could not open SPI device @ "%s". Error: %j', spiDevice || this.spiDevice, err);
    }

    //set gamma correction value
    this.gamma = gamma ? gamma : 2.5;

    // compute gamma correction table
    for (var i = 0; i < 256; i++) {
      this.gammatable[i] = Math.round(255 * Math.pow(i / 255, this.gamma));
    }
  },

  /*
   * disconnect from SPI port
   */
  disconnect: function (colour) {
    if (this.spiFd) {
      var rgb = {
        r: 0,
        g: 0,
        b: 0
      };
      if (colour) {
        rgb = h2r(colour);
      }

      logger.log('info', 'Closing SPI device with colour "%j"', rgb);

      var buff = this.fill(rgb.r, rgb.g, rgb.b);
      this.sendRgbBuf(buff);
      fs.closeSync(this.spiFd);
      this.isOpen = false;
      this.spiFd = null;
    }
  },

  isBufferOpen: function () {
    return this.isOpen;
  },

  completeBuffer: function (origBuffer) {
    var bufSize = this.numLEDs * this.bytePerPixel,
      start = this.sectionStart * this.bytePerPixel;

    logger.log('info', 'Completing original buffer of size %d from position %d.', origBuffer.length, start);

    if (origBuffer.length === bufSize) {
      return origBuffer;
    }

    var newBuff;
    try {
      newBuff = fs.readFileSync('state');
    } catch (err) {
      logger.log('info', 'Could not read from backup file. Falling back to filling the strip with blank leds.');
       newBuff = this.fill(0x00, 0x00, 0x00, true);
    }

    origBuffer.copy(newBuff, start);
    return newBuff;
  },

  sendRgbBuf: function (buffer) {
    var bufSize = this.numLEDs * this.bytePerPixel,
      i = 0;

    buffer = this.completeBuffer(buffer);

    if (this.spiFd) {
      logger.log('info', 'Writing buffer to the SPI device.');

      //number of zeros to "reset" LPD8806 stripe
      var numLeadingZeros = Math.ceil(this.numLEDs / 24);

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
      fs.writeFileSync('state', aBuf);
    }
  },

  /*
   * fill whole stripe with one color
   */
  fill: function (r, g, b, allStrip) {
    if (this.spiFd) {
      var i = 0,
        bufSize = allStrip ? (this.numLEDs * this.bytePerPixel) :
          ((this.sectionEnd - this.sectionStart) * this.bytePerPixel),
        aBuf = new Buffer(bufSize);

      logger.log('info', 'Filling %s buffer with RGB[%d,%d,%d].', (allStrip ? 'full': 'section'), r, g, b);

      for (i; i < (bufSize); i += this.bytePerPixel) {
        aBuf[i + 0] = r;
        aBuf[i + 1] = g;
        aBuf[i + 2] = b;
      }

      return aBuf;
    }
  },

  /**
   * Config is an object like this
   * {
   *   animation: [rainbow|flashing|knightrider|standard],
   *   speed: ms,
   *   colour: hex-format
   * }
   */
  animate: function (config) {
    var self = this,
      bufferSize = (this.sectionEnd - this.sectionStart) * this.bytePerPixel,
      buffer = new Buffer(bufferSize),
      rgb = h2r(config.colour);

    logger.log('info', 'Animating strip with config: %j', config);

    if (config.animation === 'rainbow') {
      return rainbow(self, buffer, config.speed);
    } else if (config.animation === 'flashing') {
      return flashing(self, buffer, config.speed, rgb);
    } else if (config.animation === 'knightrider') {
      return knightRider(self, buffer, config.speed);
    } else {
      return standard(self, buffer, config.speed, rgb);
    }
  }

};

module.exports = new LedStripe();