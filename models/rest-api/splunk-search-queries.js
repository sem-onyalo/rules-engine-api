"use strict";

module.exports = {
  //ToDo: replace with actual splunk query string
  ORDERS_CREATED_IN_TIMESPAN: 'search order %s | eval earliest=relative_time(%s, "%s")'
}
