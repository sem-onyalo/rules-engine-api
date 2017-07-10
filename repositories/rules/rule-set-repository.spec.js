"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const RuleSetRepository = require('./rule-set-repository');

describe('RuleSetRepository', () => {
  describe('selectById(id)', () => {
    it('should export function', () => {
      let ruleSetRepository = new RuleSetRepository();
      expect(ruleSetRepository.selectById).to.be.a('function');
    });
  });
});
