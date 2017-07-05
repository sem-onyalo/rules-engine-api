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

  it('should define the properties: Id, Threshold', () => {
    let rule = new RuleScoreThreshold();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Threshold');
    expect(rule).to.have.property('ChildRules');
  });

  it('should set the defined properties on initialization', () => {
    let rule = new RuleScoreThreshold(1, 50, [{RuleType:RuleType.DIFFERENT_EMAIL,RuleId:963},{RuleType:RuleType.SOURCE_IP,RuleId:852}]);
    assert.strictEqual(rule.Id, 1, 'Id was not set to expected value');
    assert.strictEqual(rule.Threshold, 50, 'Threshold was not set to expected value');
    assert.deepEqual(rule.ChildRules, [{RuleType:RuleType.DIFFERENT_EMAIL,RuleId:963},{RuleType:RuleType.SOURCE_IP,RuleId:852}], 'ChildRules was not set to expected value');
  });
});
