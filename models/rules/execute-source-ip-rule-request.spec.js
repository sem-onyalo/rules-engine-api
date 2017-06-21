"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleRequest = require('./execute-rule-request');
const ExecuteSourceIpRuleRequest = require('./execute-source-ip-rule-request');

describe('ExecuteSourceIpRuleRequest', () => {
  it('should inherit from the class ExecuteRuleRequest', () => {
    let request = new ExecuteSourceIpRuleRequest();
    expect(request).to.be.an.instanceOf(ExecuteRuleRequest);
  });

  it('should define the properties: SourceIp', () => {
    let request = new ExecuteSourceIpRuleRequest();
    expect(request).to.have.property('SourceIp');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteSourceIpRuleRequest(123, '127.0.0.1');
    assert.strictEqual(request.RuleId, 123, 'RuleId was not set to expected value');
    assert.strictEqual(request.SourceIp, '127.0.0.1', 'SourceIp was not set to the expected value');
  });
});
