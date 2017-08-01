"use strict";

const Models = require('../../models');

module.exports = class RuleSetRepository {
  constructor(dbContext) {
    this._dbContext = dbContext;
  }

  async selectById(ruleSetId) {
    let query =  "SELECT ruleset.ID, rule_id, type_rule, score, rule_order FROM ruleset, ruleset_rule, rule WHERE ruleset.id = :id AND ruleset.id = ruleset_rule.RULESET_ID AND rule.id = ruleset_rule.RULE_ID ORDER BY ruleset_rule.RULE_ORDER;"
    let params = { id: ruleSetId };
    let result = await this._dbContext.query(query, params);
    let ruleSet = null;
    if (result != null && result.rows.length > 0) {
      ruleSet = new Models.Rules.RuleSet();
      ruleSet.Id = this._dbContext.getValueFromResultSet(result, 'ID');
      ruleSet.Rules = [];
      for (var i=0; i < result.rows.length; i++ ) {
        let rule = new Models.Rules.Rule();
        rule.Id = this._dbContext.getValueFromResultSet(result, 'RULE_ID', i);
        rule.Type_rule = this._dbContext.getValueFromResultSet(result, 'TYPE_RULE', i);
        rule.Score = this._dbContext.getValueFromResultSet(result, 'SCORE', i);
        ruleSet.Rules.push(rule);
      }
    }

    return ruleSet;
  }

  async selectAll() {
    let query = 'select ID, NAME from RULESET';
    let params = {};
    let result = await this._dbContext.query(query, params);

    let ruleSets = [];
    if (result !== null && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        let ruleSet = new Models.Rules.RuleSet();
        ruleSet.Id = this._dbContext.getValueFromResultSet(result, 'ID', i);
        ruleSet.Name = this._dbContext.getValueFromResultSet(result, 'NAME', i);
        ruleSets.push(ruleSet);
      }
    }

    return ruleSets;
  }

  async insert(ruleSet) {
    let query = 'insert into RULESET (ID, NAME, STOPPROCESSINGONFAIL) values (RULESET_ID_SEQ.nextval, :name, :stop_on_fail) returning ID into :inserted_id';
    let params = { name: ruleSet.Name, stop_on_fail: ruleSet.StopProcessingOnFail ? 1 : 0, inserted_id: 0 };
    let result = await this._dbContext.query(query, params);

    if (result && result.outBinds.inserted_id.length > 0) {
      ruleSet.Id = result.outBinds.inserted_id[0];
    }

    return ruleSet;
  }
}
