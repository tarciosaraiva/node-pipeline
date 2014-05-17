'use strict';

var nconf = require('nconf');

// configure nconf
nconf.file({
  file: 'config.json'
});

module.exports = nconf;