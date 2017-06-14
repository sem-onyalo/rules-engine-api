"use strict";

const Constants = require('./rest-api-constants');

module.exports = class RestApiClient {
  constructor() {

  }

  getRequest(uri) {
    let response = this.request(Constants.RequestMethod.Get, uri);
    return response;
  }

  postJsonRequest(uri, content) {
    let response = this.postRequest(Constants.RequestMethod.Post, uri, Constants.ContentType.Json, content);
    return response;
  }

  postRequest(uri, contentType, content) {
    let response = this.request(Constants.RequestMethod.Post, uri, contentType, content);
    return response;
  }

  request(method, uri, contentType = null, content = null) {
    return null;
  }
}
