"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const RuleRepository = require('./rule-repository');

describe('RuleRepository', () => {
  describe('selectById(id)', () => {
    it('should export function', () => {
      let ruleRepository = new RuleRepository();
      expect(ruleRepository.selectById).to.be.a('function');
    });
  });
});
