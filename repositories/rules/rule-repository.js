"use strict";

const Models = require('../../models');

const selectRuleSql = 'select r.ID, r.PARENT_RULE_ID, r.TYPE_RULE, r.SCORE, r.EMAIL_ON_FAIL '
  + '    , rf.THRESHOLDCOUNT AS THRESHOLD_COUNT, rf.THRESHOLDMINUTE AS THRESHOLD_MINUTE '
  + '    , raf.THRESHOLDCOUNT AS ACCOUNT_THRESHOLD_COUNT, raf.THRESHOLDMINUTE AS ACCOUNT_THRESHOLD_MINUTE, raf.ACCOUNTCOUNTTHRESHOLD AS ACCOUNT_COUNT_THRESHOLD '
  + '    , rcc.LIST_COUNTRY_CODE '
  + '    , rst.SCORE_THRESHOLD '
  + '    , re.EMAILTO, re.EMAILSUBJECT, re.EMAILBODY '
  + '    , CHILD_RULE.ID as CHILD_RULE_ID, CHILD_RULE.TYPE_RULE as CHILD_RULE_TYPE_RULE, CHILD_RULE.SCORE as CHILD_RULE_SCORE '
  + '    , CHILD_RULE.EMAIL_ON_FAIL as CHILD_RULE_EMAIL_ON_FAIL, CHILD_RULE.EMAILTO AS CHILD_RULE_EMAILTO, CHILD_RULE.EMAILSUBJECT AS CHILD_RULE_EMAILSUBJECT '
  + '    , CHILD_RULE.EMAILBODY AS CHILD_RULE_EMAILBODY '
  + 'from RULE r '
  + 'inner join RULESET_RULE rsr on rsr.RULE_ID = r.ID '
  + 'inner join RULESET rs on rs.ID = rsr.RULESET_ID '
  + 'left join RULE_FREQUENCY rf on rf.RULE_ID = r.ID '
  + 'left join RULE_ACCOUNT_FREQUENCY raf on raf.RULE_ID = r.ID '
  + 'left join RULE_COUNTRY_CODE rcc on rcc.RULE_ID = r.ID '
  + 'left join RULE_SCORE_THRESHOLD rst on rst.RULE_ID = r.ID '
  + 'left join RULEEMAIL re on re.RULE_ID = r.ID '
  + 'left join ( '
  + '    select r.ID, r.PARENT_RULE_ID, r.TYPE_RULE, r.SCORE, r.EMAIL_ON_FAIL '
  + '        , re.EMAILTO, re.EMAILSUBJECT, re.EMAILBODY '
  + '    from RULE r '
  + '    left join RULEEMAIL re on re.RULE_ID = r.ID '
  + ') CHILD_RULE on CHILD_RULE.PARENT_RULE_ID = r.ID ';

module.exports = class RuleRepository {
  constructor(dbContext) {
    this._dbContext = dbContext;
  }

  async selectById(id) {
    let query = selectRuleSql + 'where r.ID = :id';
    let params = { id: id };
    let result = await this._dbContext.query(query, params);

    let rule = null;
    if (result !== null && result.rows.length > 0) {
      rule = this.getRuleFromDataSet(result);
    }

    return rule;
  }

  async selectByRuleSetId(id) {
    let query = selectRuleSql + 'where rs.ID = :id';
    let params = { id: id };
    let result = await this._dbContext.query(query, params);

    let rules = [];
    if (result && result.rows.length > 0) {
      for (let i = 0; i < result.rows.length; i++) {
        rules.push(this.getRuleFromDataSet(result, '', i));
      }
    }

    return rules;
  }

  async insert(ruleSetId, rule) {
    let query = 'insert into RULE (ID, PARENT_RULE_ID, TYPE_RULE, SCORE, EMAIL_ON_FAIL) '
      + 'values (RULE_ID_SEQ.nextval, :parentRuleId, :ruleType, :ruleScore, :emailOnFail) '
      + 'returning ID into :inserted_id';
    let params = { parentRuleId: rule.ParentId, ruleType: rule.Type, ruleScore: rule.Score, emailOnFail: rule.EmailOnFail ? 1 : 0, inserted_id: 0 };
    let result = await this._dbContext.query(query, params);

    if (result && result.outBinds.inserted_id.length > 0) {
      let ruleId = result.outBinds.inserted_id[0];

      query = 'insert into RULESET_RULE (RULESET_ID, RULE_ID, RULE_ORDER) '
        + 'select :ruleSetId, :ruleId, coalesce(max(RULE_ORDER), 0) + 1 '
        + 'from RULESET_RULE '
        + 'where RULESET_ID  = :ruleSetId';
      params = { ruleId: ruleId, ruleSetId: ruleSetId };
      result = await this._dbContext.query(query, params);

      if (result && result.rowsAffected > 0) {
        rule.Id = ruleId;
        return rule;
      }
    }
  }

  async update(rule) {
    let query = 'update RULE set '
      + 'PARENT_RULE_ID = :parentRuleId '
      + ', TYPE_RULE = :ruleType '
      + ', SCORE = :ruleScore '
      + ', EMAIL_ON_FAIL = :emailOnFail '
      + 'where ID = :ruleId';
    let params = { parentRuleId: rule.ParentId, ruleType: rule.Type, ruleScore: rule.Score, emailOnFail: rule.EmailOnFail ? 1 : 0, ruleId: rule.Id };
    let result = await this._dbContext.query(query, params);

    if (result && result.rowsAffected > 0) {
      return rule;
    }
  }

  getRuleFromDataSet(dataSet, colNamePrefix = '', rowIndex = 0) {
    let ruleIdColName = colNamePrefix + 'ID';
    let ruleTypeColName = colNamePrefix + 'TYPE_RULE';
    let ruleScoreColName = colNamePrefix + 'SCORE';
    let ruleEmailOnFailColName = colNamePrefix + 'EMAIL_ON_FAIL';
    let ruleEmailToColName = colNamePrefix + 'EMAILTO';
    let ruleEmailSubjectColName = colNamePrefix + 'EMAILSUBJECT';
    let ruleEmailBodyColName = colNamePrefix + 'EMAILBODY';

    let rule = null;
    let ruleId = this._dbContext.getValueFromResultSet(dataSet, ruleIdColName, rowIndex);
    let ruleType = this._dbContext.getValueFromResultSet(dataSet, ruleTypeColName, rowIndex);
    let ruleScore = this._dbContext.getValueFromResultSet(dataSet, ruleScoreColName, rowIndex);
    let ruleEmailOnFail = this._dbContext.getValueFromResultSet(dataSet, ruleEmailOnFailColName, rowIndex) === 1;
    let ruleEmailTo = this._dbContext.getValueFromResultSet(dataSet, ruleEmailToColName, rowIndex);
    let ruleEmailSubject = this._dbContext.getValueFromResultSet(dataSet, ruleEmailSubjectColName, rowIndex);
    let ruleEmailBody = this._dbContext.getValueFromResultSet(dataSet, ruleEmailBodyColName, rowIndex);

    switch (ruleType) {
      case Models.Rules.RuleType.ACCOUNT_LOCKED:
      case Models.Rules.RuleType.EMAIL_BLOCKLIST:
      case Models.Rules.RuleType.DIFFERENT_EMAIL:
        rule = new Models.Rules.Rule(ruleId, ruleScore, ruleType, ruleEmailOnFail);
        if (ruleEmailOnFail) {
          rule.EmailTo = ruleEmailTo;
          rule.EmailSubject = ruleEmailSubject;
          rule.EmailBody = ruleEmailBody;
        }
        return rule;

      case Models.Rules.RuleType.SOURCE_IP:
        rule = new Models.Rules.RuleSourceIp();
        rule.Id = ruleId;
        rule.Type = ruleType;
        rule.Score = ruleScore;
        rule.EmailOnFail = ruleEmailOnFail;
        if (ruleEmailOnFail) {
          rule.EmailTo = ruleEmailTo;
          rule.EmailSubject = ruleEmailSubject;
          rule.EmailBody = ruleEmailBody;
        }
        rule.CountryCodes = [];
        for (let i = 0; i < dataSet.rows.length; i++) {
            rule.CountryCodes.push(this._dbContext.getValueFromResultSet(dataSet, 'LIST_COUNTRY_CODE', i));
        }
        return rule;

      case Models.Rules.RuleType.ORDERS_CREATED:
        rule = new Models.Rules.RuleFrequency();
        rule.Id = ruleId;
        rule.Type = ruleType;
        rule.Score = ruleScore;
        rule.EmailOnFail = ruleEmailOnFail;
        if (ruleEmailOnFail) {
          rule.EmailTo = ruleEmailTo;
          rule.EmailSubject = ruleEmailSubject;
          rule.EmailBody = ruleEmailBody;
        }
        rule.ThresholdCount = this._dbContext.getValueFromResultSet(dataSet, 'THRESHOLD_COUNT');
        rule.ThresholdMinutes = this._dbContext.getValueFromResultSet(dataSet, 'THRESHOLD_MINUTE');
        return rule;

      case Models.Rules.RuleType.REQUESTS_FROM_IP:
        rule = new Models.Rules.RuleAccountFrequency();
        rule.Id = ruleId;
        rule.Type = ruleType;
        rule.Score = ruleScore;
        rule.EmailOnFail = ruleEmailOnFail;
        if (ruleEmailOnFail) {
          rule.EmailTo = ruleEmailTo;
          rule.EmailSubject = ruleEmailSubject;
          rule.EmailBody = ruleEmailBody;
        }
        rule.ThresholdCount = this._dbContext.getValueFromResultSet(dataSet, 'ACCOUNT_THRESHOLD_COUNT');
        rule.ThresholdMinutes = this._dbContext.getValueFromResultSet(dataSet, 'ACCOUNT_THRESHOLD_MINUTE');
        rule.AccountCountThreshold = this._dbContext.getValueFromResultSet(dataSet, 'ACCOUNT_COUNT_THRESHOLD');
        return rule;

      case Models.Rules.RuleType.SCORE_THRESHOLD:
        rule = new Models.Rules.RuleScoreThreshold();
        rule.Id = ruleId;
        rule.Type = ruleType;
        rule.Score = ruleScore;
        rule.EmailOnFail = ruleEmailOnFail;
        if (ruleEmailOnFail) {
          rule.EmailTo = ruleEmailTo;
          rule.EmailSubject = ruleEmailSubject;
          rule.EmailBody = ruleEmailBody;
        }
        rule.Threshold = this._dbContext.getValueFromResultSet(dataSet, 'SCORE_THRESHOLD');
        rule.ChildRules = [];
        for (let i = 0; i < dataSet.rows.length; i++) {
          let childRule = this.getRuleFromDataSet(dataSet, 'CHILD_RULE_', i);
          if (childRule !== null) {
            rule.ChildRules.push(childRule);
          }
        }
        return rule;

      default:
        return null;
    }
  }
}
