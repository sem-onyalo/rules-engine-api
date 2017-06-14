"use strict";

const RestApiClient = require('./rest-api-client');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('RestApiClient', () => {
  const uri = 'uri/';
  const jsonContent = '{ "FirstName": "Joe" }';
  const jsonContentType = 'application/json';

  let restApiClient;

  beforeEach(function () {
    restApiClient = new RestApiClient();
  });

  it('should not be null', () => {
    assert.isNotNull(restApiClient, 'RestApiClient instance is null');
  });

  describe('request()', () => {
    it('should export function', () => {
      expect(restApiClient.request).to.be.a('function');
    });
  });

  describe('getRequest()', () => {
    it('should export function', () => {
      expect(restApiClient.getRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.getRequest(uri);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'GET', uri);
    });
  });

  describe('postRequest()', () => {
    it('should export function', () => {
      expect(restApiClient.postRequest).to.be.a('function');
    });

    it('should call request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'request');

      restApiClient.postRequest(uri, jsonContentType, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'POST', uri, jsonContentType, jsonContent);
    });
  });

  describe('postJsonRequest()', () => {
    it('should export function', () => {
      expect(restApiClient.postJsonRequest).to.be.a('function');
    });

    it('should call post request function with expected parameters', () => {
      let requestStub = sinon
        .stub(restApiClient, 'postRequest');

      restApiClient.postJsonRequest(uri, jsonContent);

      requestStub.restore();

      sinon.assert.calledOnce(requestStub);
      sinon.assert.calledWith(requestStub, 'POST', uri, jsonContentType, jsonContent);
    });
  });
});
