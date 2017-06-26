"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const GeolocationIpLookupResponse = require('./geolocation-ip-lookup-response');

describe('GeolocationIpLookupResponse', () => {
  it('should define the properties: Country', () => {
    let response = new GeolocationIpLookupResponse();
    expect(response).to.have.property('Country');
  });

  it('should set the defined properties on initialization', () => {
    let response = new GeolocationIpLookupResponse(
      'TH'
    );

    assert.strictEqual(response.Country, 'TH', 'Country was not set to the expected value');
  });
});
