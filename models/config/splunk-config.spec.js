"use strict";

const SplunkConfig = require('./splunk-config');

const assert = require('chai').assert;
const expect = require('chai').expect;

describe('SplunkConfig', () => {
  it('should define type as an object', () => {
    expect(SplunkConfig).to.be.an('object');
  });

  describe('Keys', () => {
    it('should define an object of keys', () => {
      expect(SplunkConfig.Keys).to.be.an('object');
    });

    it('should define a key SPLUNK with value "Splunk"', () => {
      expect(SplunkConfig.Keys.SPLUNK).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.SPLUNK, 'Splunk', 'SPLUNK config key not expected value');
    });

    it('should define a key API_USER with value "API_USER"', () => {
      expect(SplunkConfig.Keys.API_USER).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_USER, 'API_USER', 'API_USER key not expected value');
    });

    it('should define a key API_PASS with value "API_PASS"', () => {
      expect(SplunkConfig.Keys.API_PASS).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_PASS, 'API_PASS', 'API_PASS key not expected value');
    });

    it('should define a key API_AUTH_SCHEME with value "API_AUTH_SCHEME"', () => {
      expect(SplunkConfig.Keys.API_AUTH_SCHEME).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_AUTH_SCHEME, 'API_AUTH_SCHEME', 'API_AUTH_SCHEME key not expected value');
    });

    it('should define a key API_SEARCH_OUTPUT_MODE with value "API_SEARCH_OUTPUT_MODE"', () => {
      expect(SplunkConfig.Keys.API_SEARCH_OUTPUT_MODE).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_SEARCH_OUTPUT_MODE, 'API_SEARCH_OUTPUT_MODE', 'API_SEARCH_OUTPUT_MODE key not expected value');
    });

    it('should define a key API_SEARCH_URI with value "API_SEARCH_URI"', () => {
      expect(SplunkConfig.Keys.API_SEARCH_URI).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_SEARCH_URI, 'API_SEARCH_URI', 'API_SEARCH_URI key not expected value');
    });

    it('should define a key API_LOGIN_PATH with value "API_LOGIN_PATH"', () => {
      expect(SplunkConfig.Keys.API_LOGIN_PATH).to.be.a('string');
      assert.strictEqual(SplunkConfig.Keys.API_LOGIN_PATH, 'API_LOGIN_PATH', 'API_LOGIN_PATH key not expected value');
    });
  });

  describe('SearchQueries', () => {
    it('should define an object of search queries', () => {
      expect(SplunkConfig.SearchQueries).to.be.an('object');
    });

    it('should define a search query ORDER_RESEND_REQUESTS', () => {
      expect(SplunkConfig.SearchQueries.ORDER_RESEND_REQUESTS).to.be.a('string');
    });

    it('should define a search query IP_RESEND_REQUESTS', () => {
      expect(SplunkConfig.SearchQueries.IP_RESEND_REQUESTS).to.be.a('string');
    });
  });
});
