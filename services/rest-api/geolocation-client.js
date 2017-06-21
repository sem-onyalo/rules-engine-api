"use strict";

const Models = require('../../models');
const RestApiClient = require('./rest-api-client');

module.exports = class GeoLocationClient extends RestApiClient {
  constructor (configService) {
    super();
    this._configService = configService;
  }

  /**
   * Geolocation IP address lookup.
   * @param {Models.RestApi.GeolocationIpLookupRequest} ipLookupRequest - The IP address lookup request object.
   *
   */
  ipLookup(ipLookupRequest) {
    let apiUri = this._configService.getSetting(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.RestApi.Keys.API_URI);
    let apiAuth = this._configService.getSetting(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.RestApi.Keys.API_AUTH_HEADER);
    let ipLookupUri = this._configService.getSetting(Models.Config.Geolocation.Keys.GEOLOC, Models.Config.Geolocation.Keys.API_IP_LOOKUP_URI);

    let requestUri = apiUri + ipLookupUri + '/' + ipLookupRequest.IpAddress;

    return this.getRequest(requestUri, apiAuth);
  }
}
