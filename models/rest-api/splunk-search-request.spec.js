"use strict";

const SplunkSearchRequest = require('./splunk-search-request');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('SplunkSearchRequest', () => {
  it('should have properties: SeachQuery, SearchQueryParams, SearchQueryResponseType', () => {
    let request = new SplunkSearchRequest();
    expect(request).to.have.property('SearchQuery');
    expect(request).to.have.property('SearchQueryParams');
    expect(request).to.have.property('SearchQueryResponseType');
  });

  it('should set the properties as expected', () => {
    let query = 'seach order %s', params = '127.0.0.1', output = 'json';
    let request = new SplunkSearchRequest(query, params, output);
    assert.strictEqual(request.SearchQuery, query, 'SearchQuery property was not set as expected');
    assert.strictEqual(request.SearchQueryParams, params, 'SearchQueryParams property was not set as expected');
    assert.strictEqual(request.SearchQueryResponseType, output, 'SearchQueryResponseType property was not set as expected');
  });
});
