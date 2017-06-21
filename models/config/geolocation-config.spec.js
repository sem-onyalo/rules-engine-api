"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const GeolocationConfig = require('./geolocation-config');

describe('GeolocationConfig', () => {
  it('should define type as an object', () => {
    expect(GeolocationConfig).to.be.an('object');
  });

  describe('Keys', () => {
    it('should define an object of keys', () => {
      expect(GeolocationConfig.Keys).to.be.an('object');
    });

    it('should define a key GEOLOC with value "Geolocation"', () => {
      expect(GeolocationConfig.Keys.GEOLOC).to.be.a('string');
      assert.strictEqual(GeolocationConfig.Keys.GEOLOC, 'Geolocation', 'GEOLOC config key not expected value');
    });

    it ('should define a key API_IP_LOOKUP_URI with value "API_IP_LOOKUP_URI"', () => {
      expect(GeolocationConfig.Keys.API_IP_LOOKUP_URI).to.be.a('string');
      assert.strictEqual(GeolocationConfig.Keys.API_IP_LOOKUP_URI, 'API_IP_LOOKUP_URI', 'API_IP_LOOKUP_URI config key not expected value');
    });
  });
});
