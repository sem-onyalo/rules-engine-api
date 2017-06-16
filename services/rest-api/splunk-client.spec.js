"use strict";

const Models = require('../../models');
const ConfigService = require('../cross-cutters/config-service');
const RestApiClient = require('./rest-api-client');
const SplunkClient = require('./splunk-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('SplunkClient', () => {
  const testSplunkApiUri = 'https://test-lo.splunk.com';
  const testSplunkApiSearchUri = '/search';
  const testSplunkApiAuthHeader = 'APIKEY 123';

  let configServiceStub;
  let configService;
  let splunkClient;

  // **************************************************
  //   Test Setup and Teardown
  // **************************************************

  beforeEach(function() {
    configService = new ConfigService();
    splunkClient = new SplunkClient(configService);

    configServiceStub = sinon.stub(configService, 'getSetting');

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_URI)
      .returns(testSplunkApiUri);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_SEARCH_URI)
      .returns(testSplunkApiSearchUri);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_AUTH_HEADER)
      .returns(testSplunkApiAuthHeader);
  });

  afterEach(function () {
    configServiceStub.restore();
  });

  // **************************************************
  //   Tests
  // **************************************************

  it('should not be null', () => {
    assert.isNotNull(splunkClient, 'Splunk client instance is null');
  });

  it('should inherit the RestApiClient class', () => {
    expect(splunkClient).to.be.an.instanceof(RestApiClient);
  });

  describe('search(splunkSearchRequest)', () => {
    it('should export function', () => {
      expect(splunkClient.search).to.be.a('function');
    });

    it('should call the RestApiClient function postRequest() with expected parameters and single search param', () => {
      let query = 'search order %s', params = ['127.0.0.1'], output = 'json';
      let request = new Models.RestApi.SplunkSearchRequest(query, params, output);
      let postJsonRequestStub = sinon.stub(splunkClient, 'postJsonRequest');

      let response = splunkClient.search(request);

      postJsonRequestStub.restore();

      let expectedPostUri = testSplunkApiUri + testSplunkApiSearchUri;
      let expectedContent = '{"search":"search order 127.0.0.1","output_mode":"json"}';

      sinon.assert.calledOnce(postJsonRequestStub);
      sinon.assert.calledWith(postJsonRequestStub, expectedPostUri, testSplunkApiAuthHeader, expectedContent);
    });

    it('should call the RestApiClient function postRequest() with expected parameters and multiple seach params', () => {
      let query = 'search order %s | eval earliest=relative_time(%s, "%s")';
      let params = ['127.0.0.1', '10/19/2016:0:0:0', '-1d'], output = 'json';
      let request = new Models.RestApi.SplunkSearchRequest(query, params, output);
      let postJsonRequestStub = sinon.stub(splunkClient, 'postJsonRequest');

      let response = splunkClient.search(request);

      postJsonRequestStub.restore();

      let expectedPostUri = testSplunkApiUri + testSplunkApiSearchUri;
      let expectedContent = '{"search":"search order 127.0.0.1 | eval earliest=relative_time(10/19/2016:0:0:0, \\"-1d\\")","output_mode":"json"}';

      sinon.assert.calledOnce(postJsonRequestStub);
      sinon.assert.calledWith(postJsonRequestStub, expectedPostUri, testSplunkApiAuthHeader, expectedContent);
    });
  });
});
