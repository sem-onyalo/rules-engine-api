"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleResponse = require('./execute-rule-response');

describe('ExecuteRuleResponse', () => {
  it('should define the properties: RuleId, IsRulePass, RuleScore', () => {
    let response = new ExecuteRuleResponse();
    expect(response).to.have.property('RuleId');
    expect(response).to.have.property('IsRulePass');
    expect(response).to.have.property('RuleScore');
  });

  it('should set the defined properties on initialization', () => {
    let response = new ExecuteRuleResponse(123, false, 4.5);
    assert.strictEqual(response.RuleId, 123, 'RuleId was not set to the expected value');
    assert.strictEqual(response.IsRulePass, false, 'IsRulePass was not set to the expected value');
    assert.strictEqual(response.RuleScore, 4.5, 'RuleScore was not set to the expected value');
  });
});
