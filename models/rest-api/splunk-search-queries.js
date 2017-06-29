"use strict";

module.exports = {
  //ToDo: replace with actual splunk query string
  ORDER_PLACED_SINCE_TIME: 'search order %s | eval earliest=relative_time(%s, "%s")'
}
