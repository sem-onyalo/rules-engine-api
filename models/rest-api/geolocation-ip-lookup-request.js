"use strict";

module.exports = class GeolocationIpLookupRequest {

  /**
   * Represents a request to get the details of an IP address.
   * @constructor
   * @param {string} ipAddress - The IP address to lookup.
   */
  constructor (ipAddress) {
    this.IpAddress = ipAddress;
  }
}
