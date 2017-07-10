"use strict";

const DsObject = require('../ds').DsObject;

module.exports = class RuleSet extends DsObject {
  constructor(id, name, rules, stopProcessingOnFail) {
    super(id);
    this.Name = name;
    this.Rules = rules;
    this.StopProcessingOnFail = stopProcessingOnFail;
  }
}
