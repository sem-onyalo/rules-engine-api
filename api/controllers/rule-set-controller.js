"use strict";

const DependencyFactory = require('../../factories/dependency-factory');
const Models = require('../../models');
const RuleService = require('../../services').RuleService;

const _unexpectedErrorMessage = 'An unexpected error has occurred';

exports.getRuleSets = async (req, res) => {
  try {
    let ruleService = DependencyFactory.resolve(RuleService);
    let ruleSets = await ruleService.getRuleSets();
    res.json({ status: 'OK', rulesets: ruleSets });
  } catch (ex) {
    let status = typeof ex === 'string' ? 'Bad Request' : 'Internal Server Error';
    let message = typeof ex === 'string' ? ex : _unexpectedErrorMessage;
    res.json({ status: status, message: message });
  }
}

exports.createRuleSet = async (req, res) => {
  try {
    let ruleService = DependencyFactory.resolve(RuleService);
    let request = new Models.Rules.CreateRuleSetRequest(req.body.Name, req.body.StopProcessingOnFail);
    let ruleSet = await ruleService.createRuleSet(request);
    res.json({ status: 'CREATED', ruleset: ruleSet });
  } catch (ex) {
    let status = typeof ex === 'string' ? 'Bad Request' : 'Internal Server Error';
    let message = typeof ex === 'string' ? ex : _unexpectedErrorMessage;
    if (typeof ex !== 'string') console.log(ex); // TODO log errors to log service
    res.json({ status: status, message: message });
  }
}

exports.executeRuleSet = async (req, res) => {
  try {
    let request = ExecuteRuleSetRequest(req);
    let ruleService = DependencyFactory.resolve(RuleService);
    let response = await ruleService.executeRuleSet(request);
    res.json({ status: 'OK', passed: response.RulePassed, message: response.Message });
  } catch (ex) {
    let status = typeof ex === 'string' ? 'Bad Request' : 'Internal Server Error';
    let message = typeof ex === 'string' ? ex : _unexpectedErrorMessage;
    res.json({ status: status, message: message });
  }
}

exports.pingRuleSet = (req, res) => {
  try {
    res.json({ status: 'OK', request: ExecuteRuleSetRequest(req)});
  } catch (ex) {
    let status = typeof ex === 'string' ? 'Bad Request' : 'Internal Server Error';
    let message = typeof ex === 'string' ? ex : _unexpectedErrorMessage;
    res.json({ status: status, message: message });
  }
}

function ExecuteRuleSetRequest(req) {
  let request = new Models.Rules.ExecuteRuleSetRequest();
  request.RuleSetId = req.params.ruleSetId;
  request.AccountId = req.query.accountid;
  request.OrderId = req.query.orderid;
  request.ExpectedEmail = req.query.owneremail;
  request.ActualEmail = req.query.requestemail;
  request.SourceIp = req.query.sourceipaddress;
  return request;
}
