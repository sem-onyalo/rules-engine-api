"use strict";

const SplunkSearchResponse = require('./splunk-search-response');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('SplunkSearchResponse', () => {
  it('should define the properties: Count', () => {
    let response = new SplunkSearchResponse();
    expect(response).to.have.property('Count');
  });

  it('should set the defined properties on initialization', () => {
    let count = 5;
    let response = new SplunkSearchResponse(count);
    assert.strictEqual(response.Count, count, 'Count was not set as expected');
  });
});
