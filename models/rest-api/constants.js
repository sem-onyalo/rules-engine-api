"use strict";

const GET = 'GET';
const POST = 'POST';

const JSON = 'application/json';
const FORM = 'application/x-www-form-urlencoded';

module.exports = {
  RequestMethod: {
      GET,
      POST
  },
  ContentType: {
    JSON,
    FORM
  }
}
