'use strict';

var fs = require('fs');
var sinon = require('sinon');
var rewire = require('rewire');
var expect = require('chai').expect;
var translator = rewire('../lib/translator');

describe('translator', function () {

  var confStub, ledstripStub, localStorageStub;
  var animateSpy, connectSpy, disconnectSpy;

  before(function () {

    confStub = {
      get: function (str) {
        if (str === 'pipelines') {
          return [{
            name: 'NP',
            stages: [{
              name: 'Bla',
              length: 10,
              offset: 0,
            }]
          }];
        } else if (str === 'leds:building') {
          return {
            animation: 'standard',
            speed: 20,
            colour: '#FF0000'
          };
        } else {
          return '#FF0000';
        }
      }
    };

    ledstripStub = {
      connect: function (offset, lengtj) {},
      animate: function () {},
      disconnect: function (colour) {},
    };

    localStorageStub = {
      setItem: function (key, val) {},
      getItem: function (key) {}
    };

    translator.__set__('conf', confStub);
    translator.__set__('ledstrip', ledstripStub);
    translator.__set__('localStorage', localStorageStub);
  });

  describe('#translate', function () {

    beforeEach(function () {
      animateSpy = sinon.spy(ledstripStub, 'animate');
      connectSpy = sinon.spy(ledstripStub, 'connect');
    });

    afterEach(function () {
      animateSpy.restore();
      connectSpy.restore();
    });

    it('should translate with valid message', function () {
      translator.translate('Build STARTED: NP - Bla #10');

      expect(animateSpy.callCount).to.eql(1);
      expect(connectSpy.callCount).to.eql(1);
    });

    it('should not translate with invalid message', function () {
      translator.translate('');

      expect(animateSpy.callCount).to.eql(0);
      expect(connectSpy.callCount).to.eql(0);
    });

  });

  describe('subsequent messages', function () {

    beforeEach(function () {
      animateSpy = sinon.spy(ledstripStub, 'animate');
      connectSpy = sinon.spy(ledstripStub, 'connect');
      disconnectSpy = sinon.spy(ledstripStub, 'disconnect');
    });

    afterEach(function () {
      animateSpy.restore();
      connectSpy.restore();
      disconnectSpy.restore();
    });

    it('should start building animation', function () {
      translator.translate('Build STARTED: NP - Bla #10');

      expect(animateSpy.callCount).to.eql(1);
      expect(connectSpy.callCount).to.eql(1);
      expect(disconnectSpy.callCount).to.eql(0);
    });

    it('should end building animation', function () {
      localStorageStub = {
        setItem: function (key, val) {},
        getItem: function (key) {
          return 0123456789;
        },
        removeItem: function (key) {}
      };

      translator.__set__('localStorage', localStorageStub);
      translator.translate('Build SUCCESS: NP - Bla #10');

      expect(animateSpy.callCount).to.eql(0);
      expect(connectSpy.callCount).to.eql(0);
      expect(disconnectSpy.callCount).to.eql(1);
    });

  });

});