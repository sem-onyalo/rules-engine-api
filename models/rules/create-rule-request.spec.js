"use strict";

const expect = require('chai').expect;

const CreateRuleRequest = require('./create-rule-request');

describe('CreateRuleRequest', () => {
  it('should define the properties: RuleSetId, ParentRuleId, RuleType, RuleScore, EmailOnFail', () => {
    let request = new CreateRuleRequest();
    expect(request).to.have.property('RuleSetId');
    expect(request).to.have.property('ParentRuleId');
    expect(request).to.have.property('RuleType');
    expect(request).to.have.property('RuleScore');
    expect(request).to.have.property('EmailOnFail');
  });

  it('should set the defined the properties on initialization', () => {
    let request = new CreateRuleRequest(9, 1, 2, 20, false);
    expect(request.RuleSetId).to.equal(9);
    expect(request.ParentRuleId).to.equal(1);
    expect(request.RuleType).to.equal(2);
    expect(request.RuleScore).to.equal(20);
    expect(request.EmailOnFail).to.equal(false);
  });
});
