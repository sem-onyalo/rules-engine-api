"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const SplunkSearchQueries = require('./splunk-search-queries');

describe('SplunkSearchQueries', () => {
  it('should define the properties: ORDERS_CREATED_IN_TIMESPAN', () => {
    expect(SplunkSearchQueries).to.have.property('ORDERS_CREATED_IN_TIMESPAN');
  });
});
