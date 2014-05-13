var fs = require('fs');
var Batch = require('batch');
var express = require('express');
var router = express.Router();
var config = require('./../lib/config');
var utils = require('./../lib/utils');
var multiparty = require('multiparty');

/* GET sounds configuration */
router.get('/', function (req, res) {
  res.json(config.get('sounds'));
});

/* Save configuration. */
router.put('/', function (req, res) {
  var payload = req.body;
  config.merge('sounds', payload);
  config.save(function (err) {
    if (err) {
      res.send(500);
    }
  });
  res.send();
});

router.post('/upload', function (req, res, next) {
  var form = new multiparty.Form(),
    batch = new Batch();

  batch.push(function (cb) {
    form.on('field', function (name, value) {
      if (name === 'flowFilename') {
        cb(null, value);
      }
    });
  });

  batch.push(function (cb) {
    form.on('file', function (name, file) {
      cb(null, file.path);
    });
  });

  batch.end(function (err, results) {
    var file = './uploads/' + results[0];
    fs.createReadStream(results[1])
      .pipe(fs.createWriteStream(file, {
        flags: 'a'
      }));

    res.send();
  });

  form.parse(req);
});

module.exports = router;