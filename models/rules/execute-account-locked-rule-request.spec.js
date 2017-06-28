"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteAccountLockedRuleRequest = require('./execute-account-locked-rule-request');
const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteAccountLockedRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let ruleRequest = new ExecuteAccountLockedRuleRequest();
    expect(ruleRequest).to.be.an.instanceof(ExecuteRuleRequest);
  });

  it('should define the properties: RuleId, AccountId', () => {
    let ruleRequest = new ExecuteAccountLockedRuleRequest();
    expect(ruleRequest).to.have.property('RuleId');
    expect(ruleRequest).to.have.property('AccountId');
  });

  it('should set the defined properties on intitialization', () => {
    let ruleRequest = new ExecuteAccountLockedRuleRequest(123, 456);
    assert.strictEqual(ruleRequest.RuleId, 123, 'RuleId was not set to the expected value');
    assert.strictEqual(ruleRequest.AccountId, 456, 'AccountId was not set to the expected value');
  });
});
