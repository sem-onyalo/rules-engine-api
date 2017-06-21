"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const Country = require('./country');

describe('CountryCode', () => {
  it('should have properties: Id, Code', () => {
    let country = new Country();
    expect(country).to.have.property('Id');
    expect(country).to.have.property('Code');
  });

  it('should set the defined properties on initialization', () => {
    let country = new Country(123, 'CA');
    assert.strictEqual(country.Id, 123, 'Id was not set to the expected value');
    assert.strictEqual(country.Code, 'CA', 'Code was not set to the expected value');
  });
});
