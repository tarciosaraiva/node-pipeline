'use strict';

var sqs = require('sqs');
var conf = require('./config');
var logger = require('./logger');
var translator = require('./translator');
var decrypt = require('./utils').decrypt;

function Queue() {
  this.polling = Number(conf.get('queue:poll'));
  this.name = conf.get('queue:name');
  this.q = sqs({
    access: decrypt(conf.get('queue:accessKey')),
    secret: decrypt(conf.get('queue:secretKey')),
    region: conf.get('queue:region')
  });
}

Queue.prototype.poll = function () {
  var self = this;
  setInterval(function () {
    self.q.pull(self.name, function (msg, cb) {
      logger.log('info', 'Processing message from queue: %j', msg);
      translator.translate(msg.Subject);
      cb();
    });
  }, self.polling);
};

module.exports = Queue;