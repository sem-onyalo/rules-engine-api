"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteRuleRequest', () => {
  it('should define the properties: RuleId', () => {
    let request = new ExecuteRuleRequest();
    expect(request).to.have.property('RuleId');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteRuleRequest(123);
    assert.strictEqual(request.RuleId, 123, 'RuleId was not set to the expected value');
  });
});
