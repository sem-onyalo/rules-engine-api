"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const ExecuteEmailBlocklistRuleRequest = require('./execute-email-blocklist-rule-request');
const ExecuteRuleRequest = require('./execute-rule-request');

describe('ExecuteEmailBlocklistRuleRequest', () => {
  it('should inherit from ExecuteRuleRequest', () => {
    let request = new ExecuteEmailBlocklistRuleRequest();
    expect(request).to.be.an.instanceOf(ExecuteRuleRequest);
  });

  it('should define the properties: Email', () => {
    let request = new ExecuteEmailBlocklistRuleRequest();
    expect(request).to.have.property('Email');
  });

  it('should set the defined properties on intitialization', () => {
    let request = new ExecuteEmailBlocklistRuleRequest(1, 'jdoe@nomail.com');
    assert.strictEqual(request.RuleId, 1, 'RuleId was not set to the expected value');
    assert.strictEqual(request.Email, 'jdoe@nomail.com', 'Email was not set to the expected value');
  });
});
