"use strict";

const DependencyFactory = require('../../factories/dependency-factory');
const Models = require('../../models');
const RuleService = require('../../services').RuleService;

exports.executeRuleSet = function (req, res) {
  let ruleSetRequest = CreateRuleSetRequest(req);
  let ruleService = DependencyFactory.resolve(RuleService);
  let ruleSetResponse = ruleService.executeRuleSet(ruleSetRequest);
  res.json({ passed: ruleSetResponse.RulePassed, message: ruleSetResponse.Message });
}

exports.pingRuleSet = function(req, res) {
  res.json(CreateRuleSetRequest(req));
}

function CreateRuleSetRequest(req) {
  let ruleSetRequest = new Models.Rules.ExecuteRuleSetRequest();
  ruleSetRequest.RuleSetId = req.params.ruleSetId;
  ruleSetRequest.AccountId = req.query.accountid;
  ruleSetRequest.OrderId = req.query.orderid;
  ruleSetRequest.ExpectedEmail = req.query.owneremail;
  ruleSetRequest.ActualEmail = req.query.requestemail;
  ruleSetRequest.SourceIp = req.query.sourceipaddress;
  return ruleSetRequest;
}
