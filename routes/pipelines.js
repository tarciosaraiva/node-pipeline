var express = require('express');
var router = express.Router();
var config = require('./../lib/config');

/* GET pipeline configuration */
router.get('/', function (req, res) {
  res.json(config.get('pipelines'));
});

/* Save configuration. */
router.put('/', function (req, res) {
  var payload = req.body;
  config.merge('pipelines', payload);
  config.save(function (err) {
    if (err) {
      res.send(500);
    }
  });
  res.send();
});

module.exports = router;