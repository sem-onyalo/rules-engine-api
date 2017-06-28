"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteDifferentEmailRuleRequest = require('./execute-different-email-rule-request');
const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteDifferentEmailRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let ruleRequest = new ExecuteDifferentEmailRuleRequest();
    expect(ruleRequest).to.be.an.instanceof(ExecuteRuleRequest);
  });

  it('should define the properties: RuleId, AccountId', () => {
    let ruleRequest = new ExecuteDifferentEmailRuleRequest();
    expect(ruleRequest).to.have.property('RuleId');
    expect(ruleRequest).to.have.property('ExpectedEmail');
    expect(ruleRequest).to.have.property('ActualEmail');
  });

  it('should set the defined properties on intitialization', () => {
    let ruleRequest = new ExecuteDifferentEmailRuleRequest(123, 'jdoe@nomail.com', 'john.doe@nomail.com');
    assert.strictEqual(ruleRequest.RuleId, 123, 'RuleId was not set to the expected value');
    assert.strictEqual(ruleRequest.ExpectedEmail, 'jdoe@nomail.com', 'ExpectedEmail was not set to the expected value');
    assert.strictEqual(ruleRequest.ActualEmail, 'john.doe@nomail.com', 'ActualEmail was not set to the expected value');
  });
});
