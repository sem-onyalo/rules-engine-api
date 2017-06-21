"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Country = require('../country');
const RuleSourceIp = require('./rule-source-ip');

describe('RuleSourceIp', () => {
  it('should define the properties: RuleId, CountryCodes', () => {
    let ruleSourceIp = new RuleSourceIp();
    expect(ruleSourceIp).to.have.property('RuleId');
    expect(ruleSourceIp).to.have.property('CountryCodes');
  });

  it('should set the defined properties on initialization', () => {
    let countryCa = new Country(1, 'CA');
    let countryUs = new Country(2, 'US');
    let ruleSourceIp = new RuleSourceIp(123, 456, [countryCa.Code, countryUs.Code]);
    assert.strictEqual(ruleSourceIp.Id, 123, 'Id was not set to the expected value');
    assert.strictEqual(ruleSourceIp.RuleId, 456, 'RuleId was not set to the expected value');
    expect(ruleSourceIp.CountryCodes).to.be.an('array');
    assert.strictEqual(ruleSourceIp.CountryCodes[0], 'CA', 'CountryCodes element 0 was not set to the expected value');
  });
});
