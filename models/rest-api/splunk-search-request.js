"use strict";

module.exports = class SplunkSearchRequest {
  constructor(searchQuery, searchQueryParams, searchQueryResponseType) {
    this.SearchQuery = searchQuery;
    this.SearchQueryParams = searchQueryParams;
    this.SearchQueryResponseType = searchQueryResponseType;
  }
}
