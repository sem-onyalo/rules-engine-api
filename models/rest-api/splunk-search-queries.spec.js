"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const SplunkSearchQueries = require('./splunk-search-queries');

describe('SplunkSearchQueries', () => {
  it('should define the properties: ORDER_PLACED_SINCE_TIME', () => {
    expect(SplunkSearchQueries).to.have.property('ORDER_PLACED_SINCE_TIME');
  });
});
