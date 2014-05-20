'use strict';

var sqs = require('sqs');
var config = require('./config');
var decrypt = require('./utils').decrypt;

function Queue() {
  this.polling = Number(config.get('queue:poll'));
  this.name = config.get('queue:name');

  // console.info('Polling "' + this.name + '" every "' + this.polling + '" ms');
  // console.info('accessKey "' + decrypt(config.get('queue:accessKey')) + '"');
  // console.info('secretKey "' + decrypt(config.get('queue:secretKey')) + '"');
  // console.info('region "' + config.get('queue:region') + '"');

  this.q = sqs({
    access: decrypt(config.get('queue:accessKey')),
    secret: decrypt(config.get('queue:secretKey')),
    region: config.get('queue:region')
  });
}

Queue.prototype = {

  poll: function () {
    var self = this;
    setInterval(function () {
      self.q.pull(self.name, function (msg, cb) {
        
      });
    }, self.polling);
  }

};

module.exports = new Queue();