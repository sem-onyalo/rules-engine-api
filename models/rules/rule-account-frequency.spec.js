"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Rule = require('./rule');
const RuleAccountFrequency = require('./rule-account-frequency');

describe('RuleAccountFrequency', () => {
  it('should inherit Rule', () => {
    let rule = new RuleAccountFrequency();
    expect(rule).to.be.an.instanceof(Rule);
  });

  it('should define the properties: Id, Score, ThresholdCount, ThresholdMinutes, AccountCountThreshold', () => {
    let rule = new RuleAccountFrequency();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Score');
    expect(rule).to.have.property('ThresholdCount');
    expect(rule).to.have.property('ThresholdMinutes');
    expect(rule).to.have.property('AccountCountThreshold');
  });

  it('should set the defined properties on initialization', () => {
    let rule = new RuleAccountFrequency(1, 2.5, 2, 180, 3);
    assert.strictEqual(rule.Id, 1, 'Id was not set to expected value');
    assert.strictEqual(rule.Score, 2.5, 'Score was not set to expected value');
    assert.strictEqual(rule.ThresholdCount, 2, 'ThresholdCount was not set to expected value');
    assert.strictEqual(rule.ThresholdMinutes, 180, 'ThresholdMinutes was not set to expected value');
    assert.strictEqual(rule.AccountCountThreshold, 3, 'AccountCountThreshold was not set to expected value');
  });
});
