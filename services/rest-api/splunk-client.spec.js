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
  const testSplunkApiUser = 'pablo';
  const testSplunkApiPass = 'escobar';
  const testSplunkApiSearchUri = '/search';
  const testSplunkApiAuthToken = 'a1b2c3';
  const testSplunkApiAuthScheme = 'Splunk';
  const testSplunkApiAuthHeader = 'Splunk a1b2c3';
  const testSplunkApiLoginPath = '/search/auth/login';
  const testSplunkApiSearchOutputMode = 'json_rows';
  const testSplunkApiSearchResponse = "{ \"rows\": [ [\"2017/01/01 09:15:00:::127.0.0.1\"], [\"2017/01/01 09:15:30:::127.0.0.1\"] ] }";

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
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_USER)
      .returns(testSplunkApiUser);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_PASS)
      .returns(testSplunkApiPass);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_AUTH_SCHEME)
      .returns(testSplunkApiAuthScheme);

    configServiceStub
      .withArgs(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_SEARCH_OUTPUT_MODE)
      .returns(testSplunkApiSearchOutputMode);

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

    it('should use the login session as the authorization header', async () => {
      let query = 'search order %s', params = ['127.0.0.1'];
      let request = new Models.RestApi.SplunkSearchRequest(query, params);

      let loginStub = sinon.stub(splunkClient, 'login')
        .returns(Promise.resolve({ sessionKey: testSplunkApiAuthToken }));

      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest')
        .returns(Promise.resolve(testSplunkApiSearchResponse));

      let response = await splunkClient.search(request);
      postXmlRequestStub.restore();
      loginStub.restore();

      let expectedPostUri = testSplunkApiUri + testSplunkApiSearchUri + '?output_mode=' + testSplunkApiSearchOutputMode;
      let expectedContent = [['search', 'search order 127.0.0.1']];

      sinon.assert.calledOnce(loginStub);
      sinon.assert.calledWith(postXmlRequestStub, expectedPostUri, testSplunkApiAuthHeader, expectedContent);
    });

    it('should call the RestApiClient function postRequest() with expected parameters and single search param', async () => {
      let query = 'search order %s', params = ['127.0.0.1'];
      let request = new Models.RestApi.SplunkSearchRequest(query, params);

      let loginStub = sinon.stub(splunkClient, 'login')
        .returns(Promise.resolve({ sessionKey: testSplunkApiAuthToken }));

      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest')
        .returns(Promise.resolve(testSplunkApiSearchResponse));

      let response = await splunkClient.search(request);
      postXmlRequestStub.restore();
      loginStub.restore();

      let expectedPostUri = testSplunkApiUri + testSplunkApiSearchUri + '?output_mode=' + testSplunkApiSearchOutputMode;
      let expectedContent = [['search', 'search order 127.0.0.1']];

      sinon.assert.calledWith(postXmlRequestStub, expectedPostUri, testSplunkApiAuthHeader, expectedContent);
    });

    it('should call the RestApiClient function postRequest() with expected parameters and multiple seach params', async () => {
      let query = 'search order %s | eval earliest=relative_time(%s, "%s")';
      let params = ['127.0.0.1', '10/19/2016:0:0:0', '-1d'];
      let request = new Models.RestApi.SplunkSearchRequest(query, params);

      let loginStub = sinon.stub(splunkClient, 'login')
        .returns(Promise.resolve({ sessionKey: testSplunkApiAuthToken }));

      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest')
        .returns(Promise.resolve(testSplunkApiSearchResponse));

      let response = await splunkClient.search(request);
      postXmlRequestStub.restore();
      loginStub.restore();

      let expectedPostUri = testSplunkApiUri + testSplunkApiSearchUri + '?output_mode=' + testSplunkApiSearchOutputMode;
      let expectedContent = [['search', 'search order 127.0.0.1 | eval earliest=relative_time(10/19/2016:0:0:0, "-1d")']];

      sinon.assert.calledWith(postXmlRequestStub, expectedPostUri, testSplunkApiAuthHeader, expectedContent);
    });

    it('should return an instance of SplunkSearchResponse with the expected count value of 2', async () => {
      let query = 'search order %s | eval earliest=relative_time(%s, "%s")';
      let params = ['127.0.0.1', '10/19/2016:0:0:0', '-1d'];
      let request = new Models.RestApi.SplunkSearchRequest(query, params);

      let loginStub = sinon.stub(splunkClient, 'login')
        .returns(Promise.resolve({ sessionKey: testSplunkApiAuthToken }));

      let postXmlRequestStub = sinon.stub(splunkClient, 'postXmlRequest')
        .returns(Promise.resolve(testSplunkApiSearchResponse));

      let response = await splunkClient.search(request);
      postXmlRequestStub.restore();
      loginStub.restore();

      expect(response).to.be.an.instanceof(Models.RestApi.SplunkSearchResponse);
      assert.strictEqual(response.Count, 2, 'Should have returned 2, which is the number of rows returned from the xml request');
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

      let expectedResponse = { sessionKey: testSplunkApiAuthToken };
      assert.isDefined(response, 'The login function should return a response');
      assert.strictEqual(response.sessionKey, testSplunkApiAuthToken, 'The login response session key property value was not expected');
    });
  });
});
