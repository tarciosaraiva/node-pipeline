var express = require('express');
var router = express.Router();
var config = require('./../lib/config');
var multiparty = require('multiparty');
var fs = require('fs');

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

// test the chunk
router.get('/upload', function (req, res) {
  res.json();
});

router.post('/upload', function (req, res, next) {
  var form = new multiparty.Form();
  form.parse(req);
  form.on('part', function (part) {
    if (part.filename) {
      part.pipe(fs.createWriteStream('./uploads/file', {
        flags: 'a'
      }));
    }
  });
  form.on('error', function (err) {
    if (err) console.log(err);
  });
  res.send();
});

module.exports = router;