"use strict";

const RestApiConfig = require('./rest-api-config');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('RestApiConfig', () => {
  it('should define type as an object', () => {
    expect(RestApiConfig).to.be.an('object');
  });

  describe('Keys', () => {
    it('should define an object of keys', () => {
      expect(RestApiConfig.Keys).to.be.an('object');
    });

    it('should define a key API_URI with value "API_URI"', () => {
      expect(RestApiConfig.Keys.API_URI).to.be.a('string');
      assert.strictEqual(RestApiConfig.Keys.API_URI, 'API_URI', 'API_URI key not expected value');
    });

    it('should define a key API_AUTH_HEADER with value "API_AUTH_HEADER"', () => {
      expect(RestApiConfig.Keys.API_AUTH_HEADER).to.be.a('string');
      assert.strictEqual(RestApiConfig.Keys.API_AUTH_HEADER, 'API_AUTH_HEADER', 'API_AUTH_HEADER key not expected value');
    });
  });
});
