"use strict";

const Models = require('../../models');
const RestApiClient = require('./rest-api-client');
const SprintfJs = require('sprintf-js');
const XmlJsConvert = require('xml-js');

module.exports = class SplunkClient extends RestApiClient {
  constructor(configService) {
    super();
    this._configService = configService;
  }

  /**
   * Splunk search
   * @param {Models.RestApi.SplunkSearchRequest} searchRequest - The search request object.
   * @returns {Models.RestApi.SplunkSearchResponse}
   */
  async search(searchRequest) {
    let apiUri = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_URI);
    let apiUser = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_USER);
    let apiPass = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_PASS);
    let searchUri = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_SEARCH_URI);
    let apiAuthScheme = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_AUTH_SCHEME);
    let searchOutputMode = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_SEARCH_OUTPUT_MODE);

    let loginResponse = await this.login({ username: apiUser, password: apiPass});
    let apiAuth = apiAuthScheme + ' ' + loginResponse.sessionKey;

    let searchRequestContent = [['search', SprintfJs.vsprintf(searchRequest.SearchQuery, searchRequest.SearchQueryParams)]];

    let requestUri = apiUri + searchUri + '?output_mode=' + searchOutputMode;

    let postResponse = await this.postXmlRequest(requestUri, apiAuth, searchRequestContent);
    let postResponseJson = JSON.parse(postResponse);

    return new Models.RestApi.SplunkSearchResponse(postResponseJson.rows.length);
  }

  /**
   * Splunk login
   * @param {Object} loginRequest - The login request with properties username and password.
   * @returns {Object} An object with property sessionKey to be used for authorized requests, or null if login failed.
   */
  async login(loginRequest) {
    let apiUri = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.RestApi.Keys.API_URI);
    let loginPath = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK, Models.Config.Splunk.Keys.API_LOGIN_PATH);

    let loginRequestContent = [['username', loginRequest.username], ['password', loginRequest.password]];
    let postResponse = await this.postXmlRequest(apiUri + loginPath, '', loginRequestContent);
    let postResponseObj = XmlJsConvert.xml2js(postResponse, {compact:true});

    let sessionKey = postResponseObj.response.hasOwnProperty('sessionKey') ? postResponseObj.response.sessionKey._text : null;

    return { sessionKey: sessionKey };
  }
}
