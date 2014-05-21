'use strict';

var sqs = require('sqs');
var decrypt = require('./utils').decrypt;

function Queue(config) {
  this.polling = Number(config.get('queue:poll'));
  this.name = config.get('queue:name');
  this.q = sqs({
    access: decrypt(config.get('queue:accessKey')),
    secret: decrypt(config.get('queue:secretKey')),
    region: config.get('queue:region')
  });
}

Queue.prototype.poll = function () {
  var self = this;
  setInterval(function () {
    self.q.pull(self.name, function (msg, cb) {

    });
  }, self.polling);
  return this;
};

module.exports = Queue;