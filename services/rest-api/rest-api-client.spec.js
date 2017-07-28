"use strict";

const Models = require('../../models');
const RestApiClient = require('./rest-api-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('RestApiClient', () => {
  // const host = 'http://dev.loyalty.com';
  // const path = '/some-path';
  const uri = 'http://dev.loyalty.com/some-path';
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

  describe('request(uri, method, auth, contentType = null, content = null)', () => {
    it('should export function', () => {
      expect(restApiClient.request).to.be.a('function');
    });
  });

  describe('getRequest(uri, auth)', () => {
    it('should export function', () => {
      expect(restApiClient.getRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.getRequest(uri, authHeader);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, uri, 'GET', authHeader);
    });
  });

  describe('postRequest(uri, auth, contentType, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.postRequest(uri, authHeader, jsonContentType, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, uri, 'POST', authHeader, jsonContentType, jsonContent);
    });
  });

  describe('postJsonRequest(uri, auth, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postJsonRequest).to.be.a('function');
    });

    it('should call post request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'postRequest');

      restApiClient.postJsonRequest(uri, authHeader, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, uri, authHeader, jsonContentType, jsonContent);
    });
  });

  describe('postXmlRequest(uri, auth, content)', () => {
    it('should export function', () => {
      expect(restApiClient.postXmlRequest).to.be.a('function');
    });

    it('should call post request function with expected parameters', () => {
      let requestStub = sinon.stub(restApiClient, 'postRequest');

      restApiClient.postXmlRequest(uri, '', [['username','pablo'],['password','escobar']]);
      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, uri, '', formContentType, 'username=pablo&password=escobar');
    });
  });
});
