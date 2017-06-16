"use strict";

const Models = require('../../models');
const RestApiClient = require('./rest-api-client');
const SprintfJs = require('sprintf-js');

module.exports = class SplunkClient extends RestApiClient {
  constructor(configService) {
    super();
    this._configService = configService;
  }

  /*
   * Splunk search
   * @param {Models.RestApi.SplunkSearchRequest} searchRequest: The search request parameters.
   *
   */
  search(searchRequest) {
    let apiUri = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK
      , Models.Config.Splunk.Keys.API_URI);

    let searchUri = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK
      , Models.Config.Splunk.Keys.API_SEARCH_URI);

    let apiAuth = this._configService.getSetting(Models.Config.Splunk.Keys.SPLUNK
      , Models.Config.Splunk.Keys.API_AUTH_HEADER);

    let searchRequestContent = SprintfJs.vsprintf(searchRequest.SearchQuery, searchRequest.SearchQueryParams);

    let jsonRequest = JSON.stringify({
      search : searchRequestContent,
      output_mode : searchRequest.SearchQueryResponseType
    });

    return this.postJsonRequest(apiUri + searchUri, apiAuth, jsonRequest);
  }
}
