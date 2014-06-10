'use strict';

var fs = require('fs');
var nconf = require('nconf');
var sinon = require('sinon');
var expect = require('chai').expect;
var Queue = require('../lib/queue');

describe('queue', function () {

  var queue;

  before(function () {
    var config = {
      queue: {
        poll: 10,
        name: 'test',
        accessKey: '66cd63eb5caa454cd70cfa96fb7db93c',
        secretKey: 'e6e002a38ad44dbce828dc410123b820c54baa79bb3f50420ca81101b123b693',
        region: 'test-reg'
      }
    };

    fs.writeFileSync('config.json', JSON.stringify(config), 'utf8');
    nconf.file({
      file: 'config.json'
    });
    queue = new Queue();
  });

  after(function () {
    fs.unlinkSync('config.json');
  });

  describe('#connect', function () {

    it('should load config from file', function () {
      expect(queue.polling).to.eql(10);
      expect(queue.name).to.eql('test');
      expect(queue.q).to.not.be.null;
    });

  });

  describe('#poll', function () {

    var clock, spy;

    beforeEach(function () {
      spy = sinon.spy(queue.q, 'pull');
      clock = sinon.useFakeTimers();
    });

    afterEach(function () {
      clock.restore();
    });

    it('should poll every couple of seconds', function () {
      queue.poll();

      setTimeout(function () {
        expect(spy.callCount).to.eql(100);
      }, 1000);
    });

  });

});