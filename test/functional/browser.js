// force the test environment to 'test'
process.env.NODE_ENV = 'test';

var assert = require('assert');
var app = require('../../app');
var Browser = require('zombie');

describe('Configuration', function () {

  before(function () {
    this.server = app.listen(3000);
    this.browser = new Browser();
  });

  it('should show configuration blocks', function () {
    this.browser.visit('http://localhost:3000', function (e, browser) {
      assert.ok(this.browser.success);
      assert.equal(this.browser.text('h1'), 'Raspberry Pi Build Pipeline');
      assert.equal(this.browser.text('h3'), 'LED strip');
      assert.equal(this.browser.text('h3'), 'Pipeline');
      assert.equal(this.browser.text('h3'), 'Sounds');
      assert.equal(this.browser.text('h3'), 'AWS Queue');
    });
  });

  after(function (done) {
    this.server.close(done);
  });
});