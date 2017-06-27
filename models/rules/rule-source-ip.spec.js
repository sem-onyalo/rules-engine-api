"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Country = require('../country');
const Rule = require('./rule');
const RuleSourceIp = require('./rule-source-ip');

describe('RuleSourceIp', () => {
  it('should inherit Rule', () => {
    let ruleSourceIp = new RuleSourceIp();
    expect(ruleSourceIp).to.be.an.instanceof(Rule);
  });

  it('should define the properties: Id, Score, CountryCodes', () => {
    let ruleSourceIp = new RuleSourceIp();
    expect(ruleSourceIp).to.have.property('Id');
    expect(ruleSourceIp).to.have.property('Score');
    expect(ruleSourceIp).to.have.property('CountryCodes');
  });

  it('should set the defined properties on initialization', () => {
    let countryCa = new Country(1, 'CA');
    let countryUs = new Country(2, 'US');
    let ruleSourceIp = new RuleSourceIp(123, 2.5, [countryCa.Code, countryUs.Code]);
    assert.strictEqual(ruleSourceIp.Id, 123, 'Id was not set to the expected value');
    assert.strictEqual(ruleSourceIp.Score, 2.5, 'Score was not set to the expected value');
    expect(ruleSourceIp.CountryCodes).to.be.an('array');
    assert.strictEqual(ruleSourceIp.CountryCodes[0], 'CA', 'CountryCodes element 0 was not set to the expected value');
  });
});
