"use strict";

const Models = require('../../models');

module.exports = class RestApiClient {
  constructor() { }

  getRequest(uri, auth) {
    let response = this.request(Models.RestApi.Constants.RequestMethod.GET, uri, auth);
    return response;
  }

  postJsonRequest(uri, auth, content) {
    let response = this.postRequest(Models.RestApi.Constants.RequestMethod.POST, uri, auth, Models.RestApi.Constants.ContentType.JSON, content);
    return response;
  }

  postRequest(uri, auth, contentType, content) {
    let response = this.request(Models.RestApi.Constants.RequestMethod.POST, uri, auth, contentType, content);
    return response;
  }

  request(method, uri, auth, contentType = null, content = null) {
    return null;
  }
}
