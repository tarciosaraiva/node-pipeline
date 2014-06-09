'use strict';

var sqs = require('sqs');
var S = require('string');
var conf = require('./config');
var ledstrip = require('./ledstrip');
var decrypt = require('./utils').decrypt;
var localStorage;

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function Queue() {
  this.polling = Number(conf.get('queue:poll'));
  this.name = conf.get('queue:name');
  this.q = sqs({
    access: decrypt(conf.get('queue:accessKey')),
    secret: decrypt(conf.get('queue:secretKey')),
    region: conf.get('queue:region')
  });
}

function findStageConfig(pipelines, pipeline, stage) {
  var stageConfig = pipelines
    .filter(function (el) {
      return el.name === pipeline;
    })[0].stages
    .filter(function (el) {
      return el.name === stage;
    });

  return stageConfig[0];
}

Queue.prototype.poll = function () {
  var self = this,
    intervalId,
    pipelines = conf.get('pipelines'),
    building = conf.get('leds:building');

  setInterval(function () {
    self.q.pull(self.name, function (msg, cb) {

      var splitMsg = msg.Subject.split(' ');
      var status = S(splitMsg[1]).toLowerCase();
      var stageConfig = findStageConfig(pipelines, splitMsg[2], splitMsg[4]);
      intervalId = localStorage.getItem(splitMsg[4]);

      if (intervalId) {
        var colour = conf.get('leds:colours:' + S(status).chompRight(':'));
        clearInterval(intervalId);
        localStorage.removeItem(splitMsg[4]);
        ledstrip.disconnectWithColour(colour);
      }

      if (status.startsWith('started')) {
        ledstrip.connect(stageConfig.offset, stageConfig.length);
        intervalId = ledstrip.animate(building);
        localStorage.setItem(splitMsg[4], intervalId);
      }

      cb();

    });
  }, self.polling);
};

module.exports = Queue;