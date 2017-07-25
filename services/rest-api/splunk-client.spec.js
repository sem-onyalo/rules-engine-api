"use strict";

const Models = require('../../models');
const ConfigService = require('../cross-cutters/config-service');
const RestApiClient = require('./rest-api-client');
const SplunkClient = require('./splunk-client');

const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('SplunkClient', () => {
  const testSplunkApiUri = 'https://test-lo.splunk.com';
  const testSplunkApiSearchUri = '/search';
  const testSplunkApiAuthHeader = 'APIKEY 123';
  const testSplunkApiLoginPath = '/search/auth/login';

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
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_URI)
      .returns(testSplunkApiUri);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_AUTH_HEADER)
      .returns(testSplunkApiAuthHeader);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_SEARCH_URI)
      .returns(testSplunkApiSearchUri);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_LOGIN_PATH)
      .returns(testSplunkApiLoginPath);
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

  describe('login(loginRequest)', () => {
    let uri = testSplunkApiUri + testSplunkApiLoginPath;
    let auth = '';

    let loginFailedResponse = '<?xml version="1.0" encoding="UTF-8"?>'
      + '<response>'
      + '  <messages>'
      + '    <msg type="WARN">Login failed</msg>'
      + '  </messages>'
      + '</response>';

    let loginSuccessResponse = '<response>'
      + '  <sessionKey>a1b2c3</sessionKey>'
      + '</response>';

    it('should export function', () => {
      expect(splunkClient.login).to.be.a('function');
    });

    it('should call RestApiClient.postXmlRequest', async () => {
      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest');
      postXmlRequestStub.returns(Promise.resolve(loginFailedResponse));

      let response = await splunkClient.login({ username: 'pablo', password: 'escobar' });
      postXmlRequestStub.restore();

      sinon.assert.calledWith(postXmlRequestStub, uri, auth, [['username', 'pablo'], ['password', 'escobar']]);
    });

    it('should return null session key if login fails', async () => {
      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest');
      postXmlRequestStub.returns(Promise.resolve(loginFailedResponse));

      let response = await splunkClient.login({ username: 'pablo', password: 'escobar' });
      postXmlRequestStub.restore();

      let expectedResponse = { sessionKey: null };
      assert.isDefined(response, 'The login function should return a response');
      assert.strictEqual(response.sessionKey, null, 'The login response should have a session key property of value null');
    });

    it('should return valid session key if login succeeds', async () => {
      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest');
      postXmlRequestStub.returns(Promise.resolve(loginSuccessResponse));

      let response = await splunkClient.login({ username: 'pablo', password: 'escobar' });
      postXmlRequestStub.restore();

      let expectedResponse = { sessionKey: 'a1b2c3' };
      assert.isDefined(response, 'The login function should return a response');
      assert.strictEqual(response.sessionKey, 'a1b2c3', 'The login response session key property value was not expected');
    });
  });
});
