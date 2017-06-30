"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRequestsFromIpInTimespanRuleRequest = require('./execute-requests-from-ip-in-timespan-rule-request');
const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteRequestsFromIpInTimespanRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let request = new ExecuteRequestsFromIpInTimespanRuleRequest();
    expect(request).to.be.an.instanceOf(ExecuteRuleRequest);
  });

  it('should define the properties: RuleId, IpAddress, AccountId', () => {
    let request = new ExecuteRequestsFromIpInTimespanRuleRequest();
    expect(request).to.have.property('RuleId');
    expect(request).to.have.property('IpAddress');
    expect(request).to.have.property('AccountId');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteRequestsFromIpInTimespanRuleRequest(123, '127.0.0.1', '456');
    assert.strictEqual(request.RuleId, 123, 'RuleId was not set to the expected value');
    assert.strictEqual(request.IpAddress, '127.0.0.1', 'IpAddress was not set to the expected value');
    assert.strictEqual(request.AccountId, '456', 'AccountId was not set to the expected value');
  });
});
