"use strict";

const DependencyFactory = require('../../factories/dependency-factory');
const Models = require('../../models');
const RuleService = require('../../services').RuleService;

const _unexpectedErrorMessage = 'An unexpected error has occurred';

exports.createRule = async (req, res) => {
  try {
    let ruleService = DependencyFactory.resolve(RuleService);
    let request = new Models.Rules.CreateRuleRequest(req.body.RuleSetId, req.body.ParentRuleId, req.body.RuleType, req.body.RuleScore, req.body.EmailOnFail);
    let rule = await ruleService.createRule(request);
    res.json({ status: 'CREATED', rule: rule });
  } catch (ex) {
    let status = typeof ex === 'string' ? 'Bad Request' : 'Internal Server Error';
    let message = typeof ex === 'string' ? ex : _unexpectedErrorMessage;
    if (typeof ex !== 'string') console.log(ex); // TODO log errors to log service
    res.json({ status: status, message: message });
  }
}
