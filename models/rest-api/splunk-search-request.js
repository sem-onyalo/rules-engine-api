"use strict";

module.exports = class SplunkSearchRequest {

  /*
   * Represents a request to search splunk
   * @constructor
   * @param {string} searchQuery - The query string for the search.
   * @param {array} searchQueryParams - The parameters to use in the search query.
   * @param {string} searchQueryResponseType - The response type of the search query response (Models.RestApi.SplunkSearchOutputTypes).
   */
  constructor(searchQuery, searchQueryParams, searchQueryResponseType) {
    this.SearchQuery = searchQuery;
    this.SearchQueryParams = searchQueryParams;
    this.SearchQueryResponseType = searchQueryResponseType;
  }
}
