'use strict';

var express = require('express');
var router = express.Router();
var config = require('./../lib/config');
var encrypt = require('./../lib/utils').encrypt;

/* GET pipeline configuration */
router.get('/', function (req, res) {
  var configData = config.get('queue');
  delete configData.accessKey;
  delete configData.secretKey;
  res.json(configData);
});

/* Save configuration. */
router.put('/', function (req, res) {
  var payload = req.body;

  payload.accessKey = encrypt(payload.accessKey);
  payload.secretKey = encrypt(payload.secretKey);

  config.merge('queue', payload);
  config.save(function (err) {
    if (err) {
      res.send(500);
    }
  });
  res.send();
});

module.exports = router;