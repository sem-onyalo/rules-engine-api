"use strict";

module.exports = class CreateRuleSetRequest {
  constructor(name, stopProcessingOnFail) {
    this.Name = name;
    this.StopProcessingOnFail = stopProcessingOnFail;
  }
}
