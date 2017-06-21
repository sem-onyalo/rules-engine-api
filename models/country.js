"use strict";

module.exports = class Country {
  /**
   * Represents a country.
   * @constructor
   * @param {int} id - The country id.
   * @param {string} code - The country code.
   */
  constructor(id, code) {
    this.Id = id;
    this.Code = code;
  }
}
