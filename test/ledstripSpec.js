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

    describe('should connect', function () {
      it('with defaults', function () {
        ledstrip.connect(10, undefined, undefined, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });

      it('with section', function () {
        ledstrip.connect(10, 4, 8, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });

      it('with numbers represented as string', function () {
        ledstrip.connect('10', '4', '5', 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });
    });

    describe('should not connect', function () {
      it('with section outside of boundaries', function () {
        ledstrip.connect(10, 4, 12, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.false;
      });

      it('with section numbers inverted', function () {
        ledstrip.connect(10, 8, 4, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.false;
      });

      it('with number of LEDs lower than one', function () {
        ledstrip.connect(-1, undefined, undefined, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.false;
      });
    });
  });

  describe('buffering data', function () {

    beforeEach(function () {
      ledstrip.connect(10, 0, 10, './ledstrip.dev');
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

    describe('#completeBuffer', function () {

      beforeEach(function () {
        ledstrip.disconnect();
        expect(ledstrip.isBufferOpen()).to.be.false;
      });

      it('should complete buffer with no color', function () {
        ledstrip.connect(10, 2, 3, './ledstrip.dev');

        var buffer = new Buffer(3);
        buffer[0] = 0xFF;
        buffer[1] = 0x00;
        buffer[2] = 0xFF;

        var updBuff = ledstrip.completeBuffer(buffer);
        expect(updBuff.length).to.equal(30);
        expect(updBuff[6]).to.equal(255);
        expect(updBuff[7]).to.equal(0);
        expect(updBuff[8]).to.equal(255);
      });

      it('should not complete when section is the size of the strip', function () {
        ledstrip.connect(10, 0, 10, './ledstrip.dev');

        var buffer = new Buffer(30);
        for (var i = 0; i < buffer.length; i++) {
          buffer[i] = 0xFF;
        }
        var updBuff = ledstrip.completeBuffer(buffer);
        expect(updBuff.length).to.equal(30);
        expect(updBuff).to.eql(buffer);
      });

    });

    //   describe('#sendRgbBuf', function () {

    //   });

    //   describe('#animate', function () {

    //   });

  });

});