"use strict";

const ExecuteRuleRequest = require('./execute-rule-request');

module.exports = class ExecuteSourceIpRuleRequest extends ExecuteRuleRequest {
  constructor (ruleId, sourceIp) {
    super(ruleId);
    this.SourceIp = sourceIp;
  }
}
