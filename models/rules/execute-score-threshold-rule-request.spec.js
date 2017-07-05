"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleRequest = require('./execute-rule-request');
const ExecuteScoreThresholdRuleRequest = require('./execute-score-threshold-rule-request');

describe('ExecuteScoreThresholdRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let request = new ExecuteScoreThresholdRuleRequest();
    expect(request).to.be.an.instanceOf(ExecuteRuleRequest);
  });

  it('should define the properties: RuleId, IpAddress, AccountId', () => {
    let request = new ExecuteScoreThresholdRuleRequest();
    expect(request).to.have.property('RuleId');
    expect(request).to.have.property('OrderId');
    expect(request).to.have.property('AccountId');
    expect(request).to.have.property('ExpectedEmail');
    expect(request).to.have.property('ActualEmail');
    expect(request).to.have.property('SourceIp');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteScoreThresholdRuleRequest(123, 456, 789, 'jdoe@nomail.com', 'john.doe@nomail.com', '127.0.0.1');
    assert.strictEqual(request.RuleId, 123, 'RuleId was not set to expected value');
    assert.strictEqual(request.OrderId, 456, 'OrderId was not set to expected value');
    assert.strictEqual(request.AccountId, 789, 'AccountId was not set to expected value');
    assert.strictEqual(request.ExpectedEmail, 'jdoe@nomail.com', 'ExpectedEmail was not set to expected value');
    assert.strictEqual(request.ActualEmail, 'john.doe@nomail.com', 'ActualEmail was not set to expected value');
    assert.strictEqual(request.SourceIp, '127.0.0.1', 'SourceIp was not set to expected value');
  });
});
