"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleRequest = require('./execute-rule-request');
const ExecuteRuleSetRequest = require('./execute-rule-set-request');

describe('ExecuteRuleSetRequest', () => {
  it('should define the properties: RuleId, OrderId, AccountId, ExpectedEmail, ActualEmail, SourceIp', () => {
    let request = new ExecuteRuleSetRequest();
    expect(request).to.have.property('RuleSetId');
    expect(request).to.have.property('OrderId');
    expect(request).to.have.property('AccountId');
    expect(request).to.have.property('ExpectedEmail');
    expect(request).to.have.property('ActualEmail');
    expect(request).to.have.property('SourceIp');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteRuleSetRequest(123, 456, 789, 'jdoe@nomail.com', 'john.doe@nomail.com', '127.0.0.1');
    assert.strictEqual(request.RuleSetId, 123, 'RuleSetId was not set to expected value');
    assert.strictEqual(request.OrderId, 456, 'OrderId was not set to expected value');
    assert.strictEqual(request.AccountId, 789, 'AccountId was not set to expected value');
    assert.strictEqual(request.ExpectedEmail, 'jdoe@nomail.com', 'ExpectedEmail was not set to expected value');
    assert.strictEqual(request.ActualEmail, 'john.doe@nomail.com', 'ActualEmail was not set to expected value');
    assert.strictEqual(request.SourceIp, '127.0.0.1', 'SourceIp was not set to expected value');
  });
});
