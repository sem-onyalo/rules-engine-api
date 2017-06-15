"use strict";

const SplunkSearchOutputTypes = require('./splunk-search-output-types');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('SplunkSearchOutputTypes', () => {
  it('should define the types: json, json_rows, json_cols, xml, csv', () => {
    expect(SplunkSearchOutputTypes.JSON).to.be.a('string');
    expect(SplunkSearchOutputTypes.JSON_ROWS).to.be.a('string');
    expect(SplunkSearchOutputTypes.JSON_COLS).to.be.a('string');
    expect(SplunkSearchOutputTypes.XML).to.be.a('string');
    expect(SplunkSearchOutputTypes.CSV).to.be.a('string');
    assert.strictEqual(SplunkSearchOutputTypes.JSON, 'json', 'json type was not set as expected');
    assert.strictEqual(SplunkSearchOutputTypes.JSON_ROWS, 'json_rows', 'json_rows type was not set as expected');
    assert.strictEqual(SplunkSearchOutputTypes.JSON_COLS, 'json_cols', 'json_cols type was not set as expected');
    assert.strictEqual(SplunkSearchOutputTypes.XML, 'xml', 'xml type was not set as expected');
    assert.strictEqual(SplunkSearchOutputTypes.CSV, 'csv', 'csv type was not set as expected');
  });
});
