"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const GeolocationIpLookupRequest = require('./geolocation-ip-lookup-request');

describe('GeolocationIpLookupRequest', () => {
  it('should have properties: IpAddress', () => {
    let request = new GeolocationIpLookupRequest();
    expect(request).to.have.property('IpAddress');
  });

  it('should set the properties as expected', () => {
    let request = new GeolocationIpLookupRequest('127.0.0.1');
    assert.strictEqual(request.IpAddress, '127.0.0.1', 'IpAddress was not set to expected value');
  });
});
