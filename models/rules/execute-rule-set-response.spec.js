"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteRuleSetResponse = require('./execute-rule-set-response');

describe('ExecuteRuleSetResponse', () => {
  it('should define the properties: RulePassed, Message', () => {
    let request = new ExecuteRuleSetResponse();
    expect(request).to.have.property('RulePassed');
    expect(request).to.have.property('Message');
  });

  it('should set the defined properties on initialization', () => {
    let request = new ExecuteRuleSetResponse(false, 'Account is locked');
    assert.strictEqual(request.RulePassed, false, 'RulePassed was not set to expected value');
    assert.strictEqual(request.Message, 'Account is locked', 'Message was not set to expected value');
  });
});
