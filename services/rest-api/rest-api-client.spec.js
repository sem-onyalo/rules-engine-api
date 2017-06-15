"use strict";

const RestApiClient = require('./rest-api-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('RestApiClient', () => {
  const uri = 'uri/';
  const authHeader = 'APIKEY 123456';
  const jsonContent = '{ "FirstName": "Joe" }';
  const jsonContentType = 'application/json';

  let restApiClient;

  beforeEach(function () {
    restApiClient = new RestApiClient();
  });

  it('should not be null', () => {
    assert.isNotNull(restApiClient, 'RestApiClient instance is null');
  });

  describe('request(method, uri, auth, contentType = null, content = null)', () => {
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
      sinon.assert.calledWith(requestStub, 'GET', uri, authHeader);
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
      sinon.assert.calledWith(requestStub, 'POST', uri, authHeader, jsonContentType, jsonContent);
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
      sinon.assert.calledWith(requestStub, 'POST', uri, authHeader, jsonContentType, jsonContent);
    });
  });
});
