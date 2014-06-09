'use strict';

var fs = require('fs');
var expect = require('chai').expect;
var sinon = require('sinon');
var ledstrip = require('../lib/ledstrip');
var conf = require('../lib/config');

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

      before(function () {
        fs.writeFileSync('config.json', '{ "leds": { "length": 10 } }', 'utf8');
        conf.load();
      });

      it('with defaults', function () {
        ledstrip.connect(undefined, undefined, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });

      it('with section', function () {
        ledstrip.connect(4, 8, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });

      it('with numbers represented as string', function () {
        ledstrip.connect('4', '5', 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.true;
      });
    });

    describe('should not connect', function () {
      it('with section outside of boundaries', function () {
        ledstrip.connect(4, 12, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.false;
      });

      it('with section numbers inverted', function () {
        ledstrip.connect(8, 4, 'ledstrip.dev');
        expect(ledstrip.isBufferOpen()).to.be.false;
      });
    });
  });

  describe('#disconnect', function () {
    var prevState;
    before(function () {
      fs.writeFileSync('config.json', '{ "leds": { "length": 10 } }', 'utf8');
      conf.load();
    });

    beforeEach(function () {
      ledstrip.connect(4, 8, 'ledstrip.dev');
    });

    it('without colour', function () {
      ledstrip.disconnect();
      prevState = fs.readFileSync('ledstrip.dev');
      expect(prevState.length).to.equal(32);

      for (var i = 0; i < prevState.length; i++) {
        if (i === 0 || i === (prevState.length - 1)) {
          expect(prevState[i]).to.equal(0);
        } else {
          expect(prevState[i]).to.equal(128);
        }
      };
    });

    it('with colour', function () {
      expect(prevState.length).to.equal(32);

      ledstrip.disconnect('#ff0000');

      var currData = fs.readFileSync('ledstrip.dev');
      expect(currData.length).to.equal(32);
      expect(currData).to.not.eql(prevState);
    });

  });

  describe('buffering data', function () {

    beforeEach(function () {
      ledstrip.connect(0, 10, './ledstrip.dev');
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
        ledstrip.connect(2, 3, './ledstrip.dev');

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
        ledstrip.connect(0, 10, './ledstrip.dev');

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

    describe('#animate', function () {

      var clock,
        spy = sinon.spy(ledstrip, 'sendRgbBuf'),
        config = {
          speed: 10,
          colour: '#a2b3c4'
        };

      beforeEach(function () {
        spy.reset();
        clock = sinon.useFakeTimers();
        ledstrip.connect(0, 10, './ledstrip.dev');
      });

      afterEach(function () {
        clock.restore();
      });

      describe('should fallback to "standard" animation', function () {
        it('when animation is not configured', function () {
          ledstrip.animate(config);

          setTimeout(function () {
            expect(ledstrip.isBufferOpen()).to.be.true;
          }, 4000);

          setTimeout(function () {
            expect(spy.called).to.be.true;
            expect(spy.callCount).to.eql(50);
            expect(ledstrip.isBufferOpen()).to.be.false;
          }, 6000);
        });

        it('when animation is configured', function () {
          config.animation = 'knightrider';
          ledstrip.animate(config);

          setTimeout(function () {
            expect(ledstrip.isBufferOpen()).to.be.true;
          }, 4000);

          setTimeout(function () {
            expect(spy.called).to.be.true;
            expect(spy.callCount).to.eql(50);
            expect(ledstrip.isBufferOpen()).to.be.false;
          }, 6000);

        });

      });

    });

  });

});