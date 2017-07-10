"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const DsObject = require('../ds').DsObject;
const Rule = require('./rule');
const RuleSet = require('./rule-set');
const RuleType = require('./rule-type');

describe('RuleSet', () => {
  it('should inherit DsObject', () => {
    let ruleSet = new RuleSet();
    expect(ruleSet).to.be.an.instanceof(DsObject);
  });

  it('should define the properties: Id, Name, Rules, StopProcessingOnFail', () => {
    let ruleSet = new RuleSet();
    expect(ruleSet).to.have.property('Id');
    expect(ruleSet).to.have.property('Name');
    expect(ruleSet).to.have.property('Rules');
    expect(ruleSet).to.have.property('StopProcessingOnFail');
  });

  it('should set the defined properties on initialization', () => {
    let rules = [new Rule(1, 0, RuleType.ACCOUNT_LOCKED), new Rule(2, 0, RuleType.EMAIL_BLOCKLIST)];
    let ruleSet = new RuleSet(1, 'Rule Set 1', rules, true);
    assert.strictEqual(ruleSet.Id, 1, 'Id was not set to expected value');
    assert.strictEqual(ruleSet.Name, 'Rule Set 1', 'Name was not set to expected value');
    assert.deepEqual(ruleSet.Rules, rules, 'Rules was not set to expected value');
    assert.strictEqual(ruleSet.StopProcessingOnFail, true, 'StopProcessingOnFail was not set to expected value');
  });
});
