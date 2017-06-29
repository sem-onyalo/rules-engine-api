"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteOrdersCreatedInTimespanRuleRequest = require('./execute-orders-created-in-timespan-rule-request');
const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteOrdersCreatedInTimespanRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let request = new ExecuteOrdersCreatedInTimespanRuleRequest();
    expect(request).to.be.an.instanceOf(ExecuteRuleRequest);
  });

  it('should define the properties: Email', () => {
    let request = new ExecuteOrdersCreatedInTimespanRuleRequest();
    expect(request).to.have.property('RuleId');
    expect(request).to.have.property('OrderId');
    expect(request).to.have.property('AccountId');
  });

  it('should set the defined properties on intitialization', () => {
    let request = new ExecuteOrdersCreatedInTimespanRuleRequest(123, '456', 'a1b2c3');
    assert.strictEqual(request.RuleId, 123, 'RuleId was not set to the expected value');
    assert.strictEqual(request.AccountId, '456', 'AccountId was not set to the expected value');
    assert.strictEqual(request.OrderId, 'a1b2c3', 'OrderId was not set to the expected value');
  });
});
