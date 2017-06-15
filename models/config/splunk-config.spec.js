"use strict";

const SplunkConfig = require('./splunk-config');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('SplunkConfig', () => {
  it('should define type as an object', () => {
    expect(SplunkConfig).to.be.an('object');
  });

  it('should define an object of keys', () => {
    expect(SplunkConfig.Keys).to.be.an('object');
  });

  it('should define a key SPLUNK with value "Splunk"', () => {
    expect(SplunkConfig.Keys.SPLUNK).to.be.a('string');
    assert.strictEqual(SplunkConfig.Keys.SPLUNK, 'Splunk', 'SPLUNK config key not expected value');
  })

  it('should define a key API_URI with value "API_URI"', () => {
    expect(SplunkConfig.Keys.API_URI).to.be.a('string');
    assert.strictEqual(SplunkConfig.Keys.API_URI, 'API_URI', 'API_URI key not expected value');
  });

  it('should define a key API_AUTH_HEADER with value "API_AUTH_HEADER"', () => {
    expect(SplunkConfig.Keys.API_AUTH_HEADER).to.be.a('string');
    assert.strictEqual(SplunkConfig.Keys.API_AUTH_HEADER, 'API_AUTH_HEADER', 'API_AUTH_HEADER key not expected value');
  });

  it('should define a key API_SEARCH_URI with value "API_SEARCH_URI"', () => {
    expect(SplunkConfig.Keys.API_SEARCH_URI).to.be.a('string');
    assert.strictEqual(SplunkConfig.Keys.API_SEARCH_URI, 'API_SEARCH_URI', 'API_SEARCH_URI key not expected value');
  });
});
