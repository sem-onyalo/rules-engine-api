"use strict";

module.exports = class ExecuteRuleSetResponse {
  constructor(rulePassed, message = '') {
    this.RulePassed = rulePassed;
    this.Message = message;
  }
}
