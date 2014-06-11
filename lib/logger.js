'use strict';

var winston = require('winston');
var logger = new(winston.Logger)({
  transports: [
    new(winston.transports.File)({
      filename: 'logs/node-pipeline.log'
    })
  ]
});

module.exports = logger;