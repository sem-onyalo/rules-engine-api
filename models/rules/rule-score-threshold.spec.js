"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Rule = require('./rule');
const RuleScoreThreshold = require('./rule-score-threshold');
const RuleType = require('./rule-type');

describe('RuleScoreThreshold', () => {
  it('should inherit Rule', () => {
    let rule = new RuleScoreThreshold();
    expect(rule).to.be.an.instanceof(Rule);
  });

  it('should define the properties: Id, Threshold, ChildRules', () => {
    let rule = new RuleScoreThreshold();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Threshold');
    expect(rule).to.have.property('ChildRules');
  });

  it('should set the defined properties on initialization', () => {
    let childRules = [
      new Rule(963, 0, RuleType.DIFFERENT_EMAIL),
      new Rule(852, 0, RuleType.SOURCE_IP)
    ];
    let rule = new RuleScoreThreshold(1, 50, childRules);
    assert.strictEqual(rule.Id, 1, 'Id was not set to expected value');
    assert.strictEqual(rule.Threshold, 50, 'Threshold was not set to expected value');
    assert.deepEqual(rule.ChildRules, childRules, 'ChildRules was not set to expected value');
  });
});
