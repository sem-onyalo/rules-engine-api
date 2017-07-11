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

  it('should define the properties: Id, Type, Score, Threshold, ChildRules', () => {
    let rule = new RuleScoreThreshold();
    expect(rule).to.have.property('Id');
    expect(rule).to.have.property('Type');
    expect(rule).to.have.property('Score');
    expect(rule).to.have.property('Threshold');
    expect(rule).to.have.property('ChildRules');
    expect(rule).to.have.property('EmailOnFail');
    expect(rule).to.have.property('EmailTo');
    expect(rule).to.have.property('EmailSubject');
    expect(rule).to.have.property('EmailBody');
  });

  it('should set the defined properties on initialization', () => {
    let childRules = [
      new Rule(963, 0, RuleType.DIFFERENT_EMAIL),
      new Rule(852, 0, RuleType.SOURCE_IP)
    ];
    let rule = new RuleScoreThreshold(1, RuleType.SCORE_THRESHOLD, 10, 50, childRules, false, 'fraudteam@nomail.com', 'Rule Failure', 'A rule failed');
    assert.strictEqual(rule.Id, 1, 'Id was not set to expected value');
    assert.strictEqual(rule.Type, RuleType.SCORE_THRESHOLD, 'Type was not set to expected value');
    assert.strictEqual(rule.Score, 10, 'Score was not set to expected value');
    assert.strictEqual(rule.Threshold, 50, 'Threshold was not set to expected value');
    assert.deepEqual(rule.ChildRules, childRules, 'ChildRules was not set to expected value');
    assert.strictEqual(rule.EmailOnFail, false, 'EmailOnFail was not set to expected value');
    assert.strictEqual(rule.EmailTo, 'fraudteam@nomail.com', 'EmailTo was not set to expected value');
    assert.strictEqual(rule.EmailSubject, 'Rule Failure', 'EmailSubject was not set to expected value');
    assert.strictEqual(rule.EmailBody, 'A rule failed', 'EmailBody was not set to expected value');
  });
});
