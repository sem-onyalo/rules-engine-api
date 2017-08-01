"use strict";

const expect = require('chai').expect;

const CreateRuleSetRequest = require('./create-rule-set-request');

describe('CreateRuleSetRequest', () => {
  it('should define the properties: Name, StopProcessingOnFail', () => {
    let request = new CreateRuleSetRequest();
    expect(request).to.have.property('Name');
    expect(request).to.have.property('StopProcessingOnFail');
  });

  it('should set the defined properties on initialization', () => {
    let request = new CreateRuleSetRequest('My rule set', true);
    expect(request.Name).to.equal('My rule set');
    expect(request.StopProcessingOnFail).to.equal(true);
  });
});
