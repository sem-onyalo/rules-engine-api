"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Rule = require('./rule');
const RuleFrequency = require('./rule-frequency');

describe('RuleFrequency', () => {
  it('should inherit Rule', () => {
    let rule = new RuleFrequency();
    expect(rule).to.be.an.instanceof(Rule);
  });

  it('should define the properties: Id, Score, ThresholdMinutes', () => {
    let rule = new RuleFrequency();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Score');
    expect(rule).to.have.property('ThresholdMinutes');
  });

  it('should set the defined properties on initialization', () => {
    let rule = new RuleFrequency(123, 2.5, 180);
    assert.strictEqual(rule.Id, 123, 'Id was not set to the expected value');
    assert.strictEqual(rule.Score, 2.5, 'Score was not set to the expected value');
    assert.strictEqual(rule.ThresholdMinutes, 180, 'ThresholdMinutes was not set to the expected value');
  });
});
