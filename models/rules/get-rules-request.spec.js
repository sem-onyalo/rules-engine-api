"use strict";

const expect = require('chai').expect;

const GetRulesRequest = require('./get-rules-request');

describe('GetRulesRequest', () => {
  it('should define the properties: RuleSetId', () => {
    let request = new GetRulesRequest();
    expect(request).to.have.property('RuleSetId');
  });

  it('should set the defined the properties on initialization', () => {
    let request = new GetRulesRequest(9);
    expect(request.RuleSetId).to.equal(9);
  });
});
