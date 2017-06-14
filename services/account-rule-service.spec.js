"use strict";

const accountRule = require('./account-rule-service');
const assert = require('chai').assert;
const expect = require('chai').expect;

describe('Account rule', () => {
  describe('isLocked()', () => {
    it('should export a function', () => {
      expect(accountRule.isLocked).to.be.a('function');
    });
  });
});
