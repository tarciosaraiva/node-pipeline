'use strict';

var expect = require('chai').expect;
var compare = require('../lib/utils').compare;
var h2r = require('../lib/utils').hexToRgb;
var enc = require('../lib/utils').encrypt;
var dec = require('../lib/utils').decrypt;

describe('utils', function () {

  describe('#compare', function () {

    var expectationNumbers = [1, 2, 4, 5, 8, 9, 11, 17];
    var expectationStrings = ['1', '2', '4', '5', '8', '9', '11', '17'];

    it('should sort numbers naturally', function () {
      var numbers = [5, 2, 17, 9, 1, 8, 11, 4];
      var sortedNumbers = numbers.sort();
      expect(sortedNumbers).to.not.deep.equal(expectationNumbers);
      sortedNumbers = numbers.sort(compare);
      expect(sortedNumbers).to.deep.equal(expectationNumbers);
    });

    it('should sort numbers represented as string naturally', function () {
      var numbers = ['5', '2', '17', '9', '1', '8', '11', '4'];
      var sortedNumbers = numbers.sort();
      expect(sortedNumbers).to.not.deep.equal(expectationStrings);
      sortedNumbers = numbers.sort(compare);
      expect(sortedNumbers).to.deep.equal(expectationStrings);
    });

  });

  describe('#hexToRgb', function () {

    var validHex = '#a2c3f4',
      validHexWoHash = 'a2c3f4',
      invalidHex = '1234567',
      invalidHexLetters = 'op12l4'

    describe('should convert', function () {
      it('with hash on hex', function () {
        var result = h2r(validHex);
        expect(result).to.deep.equal({
          r: 162,
          g: 195,
          b: 244
        });
      });

      it('without hash on hex', function () {
        var result = h2r(validHexWoHash);
        expect(result).to.deep.equal({
          r: 162,
          g: 195,
          b: 244
        });
      });
    });

    it('should return black when invalid hex', function () {
      var result = h2r(invalidHex);
      expect(result).to.deep.equal({
        r: 0x00,
        g: 0x00,
        b: 0x00
      });
    });

    it('should return black when no hex provided', function () {
      var result = h2r(null);
      expect(result).to.deep.equal({
        r: 0x00,
        g: 0x00,
        b: 0x00
      });
    });

    it('should return black when invalid hex letters', function () {
      var result = h2r(invalidHexLetters);
      expect(result).to.deep.equal({
        r: 0x00,
        g: 0x00,
        b: 0x00
      });
    });

  });

  describe('#encrypt / #decrypt', function () {

    var dataToEncrypt = 'raspberry pipeline ui';

    it('should encrypt and decrypt data', function () {
      var data = enc(dataToEncrypt);
      expect(data).to.not.be.null;
      data = dec(data);
      expect(data).to.equal(dataToEncrypt);
    });

  })

});