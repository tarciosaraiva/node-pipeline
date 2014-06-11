'use strict';

var conf = require('./config');
var logger = require('./logger');
var ledstrip = require('./ledstrip');
var MSG_REGEX = /^Build\s(\w*)\:\s(.*)\s(\#\d*)$/;

var localStorage;

if (typeof localStorage === 'undefined' || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function execRegex(msg) {
  var groups = MSG_REGEX.exec(msg);

  if (groups) {
    var pipelines = conf.get('pipelines'),
      buildPipelineStage = groups[2].split('-'),
      config = pipelines
        .filter(function (el) {
          return el.name === buildPipelineStage[0].trim();
        })[0].stages
        .filter(function (el) {
          return el.name === buildPipelineStage[1].trim();
        })[0];

    return {
      pipeline: buildPipelineStage[0].trim(),
      stage: buildPipelineStage[1].trim(),
      status: groups[1].toLowerCase(),
      buildNum: groups[3],
      config: config
    }
  }
}

module.exports.translate = function (msg) {
  var building = conf.get('leds:building'),
    build = execRegex(msg);

  logger.log('info', 'Translating msg [%s] to build config [%j]', msg, build);

  if (build) {

    var intervalId = localStorage.getItem(build.stage)

    if (intervalId) {
      clearInterval(intervalId);
      localStorage.removeItem(build.stage);
      ledstrip.disconnect(conf.get('leds:colours:' + build.status));
    }

    if (build.status.indexOf('started') > -1) {
      ledstrip.connect(build.config.offset, build.config.length);
      intervalId = ledstrip.animate(building);
      localStorage.setItem(build.stage, intervalId);
    }
  }

}