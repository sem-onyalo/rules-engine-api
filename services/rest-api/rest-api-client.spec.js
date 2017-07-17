"use strict";

const Models = require('../../models');
const RestApiClient = require('./rest-api-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('RestApiClient', () => {
  const host = 'http://dev.loyalty.com';
  const path = '/some-path';
  const authHeader = 'APIKEY 123456';
  const jsonContent = '{ "FirstName": "Joe" }';
  const jsonContentType = Models.RestApi.Constants.ContentType.JSON;
  const formContentType = Models.RestApi.Constants.ContentType.FORM;

  let restApiClient;

  beforeEach(function () {
    restApiClient = new RestApiClient();
  });

  it('should not be null', () => {
    assert.isNotNull(restApiClient, 'RestApiClient instance is null');
  });

  describe('request(method, host, path, auth, contentType = null, content = null)', () => {
    it('should export function', () => {
      expect(restApiClient.request).to.be.a('function');
    });
  });

  describe('getRequest(host, path, auth)', () => {
    it('should export function', () => {
      expect(restApiClient.getRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.getRequest(host, path, authHeader);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'GET', host, path, authHeader);
    });
  });

  describe('postRequest(host, path, auth, contentType, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.postRequest(host, path, authHeader, jsonContentType, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'POST', host, path, authHeader, jsonContentType, jsonContent);
    });
  });

  describe('postJsonRequest(host, path, auth, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postJsonRequest).to.be.a('function');
    });

    it('should call post request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'postRequest');

      restApiClient.postJsonRequest(host, path, authHeader, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'POST', host, path, authHeader, jsonContentType, jsonContent);
    });
  });

  describe('postXmlRequest(host, path, auth, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postXmlRequest).to.be.a('function');
    });

    it('should call post request function with expected parameters', () => {
      let requestStub = sinon.stub(restApiClient, 'postRequest');

      restApiClient.postXmlRequest(host, path, '', [['username','pablo'],['password','escobar']]);
      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'POST', host, path, '', formContentType, 'username=pablo&password=escobar');
    });
  });
});
