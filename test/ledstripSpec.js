'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var ledstrip = require('../lib/ledstrip');

describe('ledstrip', function () {

  before(function () {
    fs.writeFileSync('ledstrip.dev', '', 'utf8');
  });

  after(function () {
    fs.unlinkSync('ledstrip.dev');
  });

  describe('#connect', function () {

    afterEach(function () {
      ledstrip.disconnect();
    });

    it('should connect with defaults', function () {
      ledstrip.connect(10, undefined, undefined, 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.true;
    });

    it('should connect with section', function () {
      ledstrip.connect(10, 4, 8, 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.true;
    });

    it('should not connect with section outside of boundaries', function () {
      ledstrip.connect(10, 4, 12, 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.false;
    });

    it('should not connect with section numbers inverted', function () {
      ledstrip.connect(10, 8, 4, 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.false;
    });

    it('should not connect with number of LEDs lower than one', function () {
      ledstrip.connect(-1, undefined, undefined, 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.false;
    });

    it('should connect with numbers represented as string', function () {
      ledstrip.connect('10', '4', '5', 'ledstrip.dev');
      expect(ledstrip.isBufferOpen()).to.be.true;
    });
  });

  describe('buffering data', function () {

    before(function () {
      ledstrip.connect(10, 0, 9, './ledstrip.dev');
    });

    afterEach(function () {
      ledstrip.disconnect();
      expect(ledstrip.isBufferOpen()).to.be.false;
    });

    describe('#fill', function () {
      it('should complete the entire strip with given colours', function () {
        var buffer = ledstrip.fill(0xFF, 0x11, 0x00);
        expect(buffer.length).to.equal(30);
      });

      it('should have undefined buffer when strip is not connected', function () {
        ledstrip.disconnect();
        var buffer = ledstrip.fill(0xFF, 0x11, 0x00);
        expect(buffer).to.be.undefined;
      });

    });

    //   describe('#completeBuffer', function () {

    //   });

    //   describe('#sendRgbBuf', function () {

    //   });

    //   describe('#animate', function () {

    //   });

  });

});