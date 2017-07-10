"use strict";

const DsObject = require('../ds').DsObject;

module.exports = class Rule extends DsObject {
  /**
   * Represents a rule executed on a source IP address.
   * @constructor
   * @param {integer} id - The unique identifier of this rule.
   * @param {float} score - The score associated to this rule.
   * @param {Models.Rules.RuleType} type - The rule type.
   * @param {bool} emailOnFail - Whether or not to send an email if the rule fails.
   * @param {string} emailTo - The email recipient(s).
   * @param {string} emailSubject - The email subject.
   * @param {string} emailBody - The email body.
   */
  constructor(id, score, type, emailOnFail, emailTo, emailSubject, emailBody) {
    super(id);
    this.Type = type;
    this.Score = score;
    this.EmailOnFail = emailOnFail;
    this.EmailTo = emailTo;
    this.EmailSubject = emailSubject;
    this.EmailBody = emailBody;
  }
}
