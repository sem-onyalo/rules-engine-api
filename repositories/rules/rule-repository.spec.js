"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const DbContext = require('../db-context');
const Models = require('../../models');
const RuleRepository = require('./rule-repository');

describe('RuleRepository', () => {
  let emailTo = 'fraudteam@nomail.com';
  let emailSubject = 'Fraud Service Email';
  let emailBody = 'A fraud rule set ran';

  let dbContext;
  let ruleRepository;

  beforeEach(() => {
    dbContext = new DbContext();
    ruleRepository = new RuleRepository(dbContext);
  });

  describe('selectById(id)', () => {
    it('should export function', () => {
      expect(ruleRepository.selectById).to.be.a('function');
    });
  });

  describe('insert(ruleSetId, rule)', () => {
    it('should export function', () => {
      expect(ruleRepository.insert).to.be.a('function');
    });
  });

  describe('getRuleFromDataSet(args)', () => {
    it('should export function', () => {
      expect(ruleRepository.getRuleFromDataSet).to.be.a('function');
    });

    it('should return null if unsupported type', () => {
      let ruleType = 0;
      let dataSet = {
        rows: [ [ 123, 0, ruleType, 10, false ] ],
        metaData: [ { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' } ]
      };

      let rule = ruleRepository.getRuleFromDataSet(dataSet);

      assert.isNull(rule, 'Returned rule should be null');
    });

    it('should return an instance of Rule', () => {
      let types = [
        Models.Rules.RuleType.ACCOUNT_LOCKED,
        Models.Rules.RuleType.EMAIL_BLOCKLIST,
        Models.Rules.RuleType.DIFFERENT_EMAIL
      ];

      for (let i = 0; i < types.length; i++) {
        let dataSet = {
          rows: [ [ 123, 0, types[i], 10, false, emailTo, emailSubject, emailBody ] ],
          metaData: [
            { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' },
            { name: 'EMAILTO' }, { name: 'EMAILSUBJECT' }, { name: 'EMAILBODY' }
          ]
        };

        let expectedRule = new Models.Rules.Rule(123, 10, types[i], false, emailTo, emailSubject, emailBody);
        let rule = ruleRepository.getRuleFromDataSet(dataSet);

        assert.deepEqual(rule, expectedRule, 'Returned rule was not expected value for rule type ' + types[i]);
      }
    });

    it('should return an instance of RuleSourceIp', () => {
      let dataSet = {
        rows: [
          [ 123, 0, Models.Rules.RuleType.SOURCE_IP, 10, false, 'CA', emailTo, emailSubject, emailBody ],
          [ 123, 0, Models.Rules.RuleType.SOURCE_IP, 10, false, 'US', emailTo, emailSubject, emailBody ]
        ],
        metaData: [
          { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' }, { name: 'LIST_COUNTRY_CODE' } ,
          { name: 'EMAILTO' }, { name: 'EMAILSUBJECT' }, { name: 'EMAILBODY' }
        ]
      };

      let expectedRule = new Models.Rules.RuleSourceIp(123, 10, ['CA', 'US']);
      expectedRule.Type = Models.Rules.RuleType.SOURCE_IP;
      expectedRule.EmailOnFail = false;
      expectedRule.EmailTo = emailTo;
      expectedRule.EmailSubject = emailSubject;
      expectedRule.EmailBody = emailBody;
      let rule = ruleRepository.getRuleFromDataSet(dataSet);

      assert.deepEqual(rule, expectedRule, 'Returned rule was not expected value');
    });

    it('should return an instance of RuleFrequency', () => {
      let dataSet = {
        rows: [ [ 123, 0, Models.Rules.RuleType.ORDERS_CREATED, 10, false, 2, 180, emailTo, emailSubject, emailBody ] ],
        metaData: [
          { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' },
          { name: 'THRESHOLD_COUNT' }, { name: 'THRESHOLD_MINUTE' }, { name: 'EMAILTO' }, { name: 'EMAILSUBJECT' }, { name: 'EMAILBODY' }
        ]
      };

      let ruleThresholdCount = 2, ruleThresholdMin = 180;
      let expectedRule = new Models.Rules.RuleFrequency(123, 10, ruleThresholdCount, ruleThresholdMin);
      expectedRule.Type = Models.Rules.RuleType.ORDERS_CREATED;
      expectedRule.EmailOnFail = false;
      expectedRule.EmailTo = emailTo;
      expectedRule.EmailSubject = emailSubject;
      expectedRule.EmailBody = emailBody;
      let rule = ruleRepository.getRuleFromDataSet(dataSet);

      assert.deepEqual(rule, expectedRule, 'Returned rule was not expected value');
    });

    it('should return an instance of RuleAccountFrequency', () => {
      let dataSet = {
        rows: [ [ 123, 0, Models.Rules.RuleType.REQUESTS_FROM_IP, 10, false, 1, 180, 2, emailTo, emailSubject, emailBody ] ],
        metaData: [
          { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' },
          { name: 'ACCOUNT_THRESHOLD_COUNT' }, { name: 'ACCOUNT_THRESHOLD_MINUTE' }, { name: 'ACCOUNT_COUNT_THRESHOLD' },
          { name: 'EMAILTO' }, { name: 'EMAILSUBJECT' }, { name: 'EMAILBODY' }
        ]
      };

      let ruleThresholdCount = 1, ruleThresholdMin = 180, accountCountThreshold = 2;
      let expectedRule = new Models.Rules.RuleAccountFrequency(123, 10, ruleThresholdCount, ruleThresholdMin, accountCountThreshold);
      expectedRule.Type = Models.Rules.RuleType.REQUESTS_FROM_IP;
      expectedRule.EmailOnFail = false;
      expectedRule.EmailTo = emailTo;
      expectedRule.EmailSubject = emailSubject;
      expectedRule.EmailBody = emailBody;
      let rule = ruleRepository.getRuleFromDataSet(dataSet);

      assert.deepEqual(rule, expectedRule, 'Returned rule was not expected value');
    });

    it('should return an instance of RuleScoreThreshold', () => {
      let dataSet = {
        rows: [
          [ 123, 0, Models.Rules.RuleType.SCORE_THRESHOLD, 10, false, 15, emailTo, emailSubject, emailBody, null, null, null, null ],
          [ 123, 0, Models.Rules.RuleType.SCORE_THRESHOLD, 10, false, 15, emailTo, emailSubject, emailBody, 124, Models.Rules.RuleType.ACCOUNT_LOCKED, 0, false ],
          [ 123, 0, Models.Rules.RuleType.SCORE_THRESHOLD, 10, false, 15, emailTo, emailSubject, emailBody, 125, Models.Rules.RuleType.EMAIL_BLOCKLIST, 1, false ]
        ],
        metaData: [
          { name: 'ID' }, { name: 'PARENT_RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' }, { name: 'EMAIL_ON_FAIL' },
          { name: 'SCORE_THRESHOLD' }, { name: 'EMAILTO' }, { name: 'EMAILSUBJECT' }, { name: 'EMAILBODY' },
          { name: 'CHILD_RULE_ID' }, { name: 'CHILD_RULE_TYPE_RULE' }, { name: 'CHILD_RULE_SCORE' }, { name: 'CHILD_RULE_EMAIL_ON_FAIL' }
        ]
      };

      let scoreThreshold = 15;
      let childRules = [
        new Models.Rules.Rule(124, 0, Models.Rules.RuleType.ACCOUNT_LOCKED, false),
        new Models.Rules.Rule(125, 1, Models.Rules.RuleType.EMAIL_BLOCKLIST, false)
      ];
      let expectedRule = new Models.Rules.RuleScoreThreshold(123, Models.Rules.RuleType.SCORE_THRESHOLD, 10, scoreThreshold, childRules);
      expectedRule.EmailOnFail = false;
      expectedRule.EmailTo = emailTo;
      expectedRule.EmailSubject = emailSubject;
      expectedRule.EmailBody = emailBody;
      let rule = ruleRepository.getRuleFromDataSet(dataSet);

      assert.deepEqual(rule, expectedRule, 'Returned rule was not expected value');
    });
  });
});
