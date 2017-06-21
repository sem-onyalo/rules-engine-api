"use strict";

const Models = require('../../models');
const ConfigService = require('../cross-cutters/config-service');
const RestApiClient = require('./rest-api-client');
const GeolocationClient = require('./geolocation-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('GeolocationClient', () => {
  const testApiUri = 'https://test-lo.geolocation.com';
  const testApiAuthHeader = 'APIKEY 123';
  const testGeolocationApiIpLookupUri = '/ipaddress';

  let configServiceStub;
  let configService;
  let geolocationClient;

  beforeEach(function () {
    configService = new ConfigService();
    geolocationClient = new GeolocationClient(configService);

    configServiceStub = sinon.stub(configService, 'getSetting');

    configServiceStub
      .withArgs(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.RestApi.Keys.API_URI)
      .returns(testApiUri);

    configServiceStub
      .withArgs(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.RestApi.Keys.API_AUTH_HEADER)
      .returns(testApiAuthHeader);

    configServiceStub
      .withArgs(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.Geolocation.Keys.API_IP_LOOKUP_URI)
      .returns(testGeolocationApiIpLookupUri);
  });

  afterEach(function () {
    configServiceStub.restore();
  });

  it('should not be null', () => {
    assert.isNotNull(geolocationClient, 'Geolocation client instance is null');
  });

  it('should inherit the RestApiClient class', () => {
    expect(geolocationClient).to.be.an.instanceof(RestApiClient);
  });

  describe('ipLookup(IpLookupRequest)', () => {
    it('should export function', () => {
      expect(geolocationClient.ipLookup).to.be.a('function');
    });

    it('should call the RestApiClient function postRequest() with expected parameters', () => {
      let ipAddress = '127.0.0.1';
      let request = new Models.RestApi.GeolocationIpLookupRequest(ipAddress);
      let getRequestStub = sinon.stub(geolocationClient, 'getRequest');

      let response = geolocationClient.ipLookup(request);

      getRequestStub.restore();

      let expectedUri = testApiUri + testGeolocationApiIpLookupUri + '/' + ipAddress;

      sinon.assert.calledOnce(getRequestStub);
      sinon.assert.calledWith(getRequestStub, expectedUri, testApiAuthHeader);
    });
  });
});
