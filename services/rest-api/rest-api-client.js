"use strict";

const Models = require('../../models');

module.exports = class RestApiClient {
  constructor() { }

  /**
   * Makes an HTTP GET request.
   * @name getRequest
   * @param {string} host - The HTTP host name.
   * @param {string} path - The request path.
   * @param {string} auth - The request authorization header.
   */
  getRequest(host, path, auth) {
    let response = this.request(Models.RestApi.Constants.RequestMethod.GET, host, path, auth);
    return response;
  }

  /**
   * Makes an HTTP JSON POST request.
   * @name postJsonRequest
   * @param {string} host - The HTTP host name.
   * @param {string} path - The request path.
   * @param {string} auth - The request authorization header.
   * @param {string} content - The request JSON string.
   */
  postJsonRequest(host, path, auth, content) {
    let response = this.postRequest(Models.RestApi.Constants.RequestMethod.POST, host, path, auth, Models.RestApi.Constants.ContentType.JSON, content);
    return response;
  }

  /**
   * Makes an HTTP XML POST request.
   * @name postXmlRequest
   * @param {string} host - The HTTP host name.
   * @param {string} path - The request path.
   * @param {string} auth - The request authorization header.
   * @param {Array} content - An array of key-value pairs.
   */
  postXmlRequest(host, path, auth, content) {
    let requestContent = '';
    for (let i = 0; i < content.length; i++) {
      requestContent += (requestContent !== '' ? '&' : '') + content[i][0] + '=' + content[i][1];
    }

    let response = this.postRequest(Models.RestApi.Constants.RequestMethod.POST, host, path, auth, Models.RestApi.Constants.ContentType.FORM, requestContent);
    return response;
  }

  /**
   * Makes an HTTP POST request.
   * @name postRequest
   * @param {string} host - The HTTP host name.
   * @param {string} path - The request path.
   * @param {string} auth - The request authorization header.
   * @param {string} contentType - The request content type.
   * @param {string} content - The request content.
   */
  postRequest(host, path, auth, contentType, content) {
    let response = this.request(Models.RestApi.Constants.RequestMethod.POST, host, path, auth, contentType, content);
    return response;
  }

  /**
   * Makes an HTTP request.
   * @name request
   * @param {string} method - The request method.
   * @param {string} host - The HTTP host name.
   * @param {string} path - The request path.
   * @param {string} auth - The request authorization header.
   * @param {string} [contentType] - The request content type.
   * @param {string} [content] - The request content.
   */
  request(method, host, path, auth, contentType = null, content = null) {
    return null;
  }
}
