"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const DbContext = require('../db-context');
const RuleSetRepository = require('./rule-set-repository');
const Models = require('../../models')

describe('RuleSetRepository', () => {
  let dbContext;
  let ruleSetRepository;

  let dataSet = {
    rows: [ [ 1, 0, 2, 3 ], [ 1, 1, 3, 2 ] ],
    metaData: [ { name: 'ID' }, { name: 'RULE_ID' }, { name: 'TYPE_RULE' }, { name: 'SCORE' } ]
  };

  beforeEach(function(){
    dbContext = new DbContext();
    ruleSetRepository = new RuleSetRepository(dbContext);
  });

  describe('selectById(args)', () => {
    it('should export function', () => {
      expect(ruleSetRepository.selectById).to.be.a('function');
    });

    it('should have an array of rules', async () => {
      let expectedRuleSet = new Models.Rules.RuleSet();

      expectedRuleSet.Id = 1;
      expectedRuleSet.Rules = [];

      var ruleOne = new Models.Rules.Rule();
      var ruleTwo = new Models.Rules.Rule();
      ruleOne.Id = 0;
      ruleOne.Type_rule = 2;
      ruleOne.Score = 3;

      ruleTwo.Id = 1;
      ruleTwo.Type_rule = 3;
      ruleTwo.Score = 2;

      expectedRuleSet.Rules.push(ruleOne);
      expectedRuleSet.Rules.push(ruleTwo);

      let dbContextStub = sinon.stub(dbContext, 'query')
      .returns(Promise.resolve(dataSet));

      let result = await ruleSetRepository.selectById(1);
      assert.deepStrictEqual(result, expectedRuleSet);
    });
  });

  describe('selectAll()', () => {
    it('should export function', () => {
      expect(ruleSetRepository.selectAll).to.be.a('function');
    });

    it('should return an array of rule sets', async () => {
      let query =  'select ID, NAME from RULESET';
      let queryParams = {};

      let expectedRuleSets = [
        new Models.Rules.RuleSet(1, 'Rule Set 1'),
        new Models.Rules.RuleSet(2, 'Rule Set 2'),
        new Models.Rules.RuleSet(3, 'Rule Set 3')
      ];

      let dbContextStub = sinon
        .stub(dbContext, 'query')
        .returns(Promise.resolve({
          rows: [ [ 1, 'Rule Set 1' ], [ 2, 'Rule Set 2' ], [ 3, 'Rule Set 3' ] ],
          metaData: [ { name: 'ID' }, { name: 'NAME' } ]
        }));

      let actual = await ruleSetRepository.selectAll();

      sinon.assert.calledOnce(dbContextStub);
      sinon.assert.calledWith(dbContextStub, query, queryParams);
      assert.deepStrictEqual(actual, expectedRuleSets);
    });
  });

  describe('insert(ruleSet)', () => {
    it('should export function', () => {
      expect(ruleSetRepository.insert).to.be.a('function');
    });

    it('should create a new rule set record via the db context', async () => {
      let dbContextStub = sinon
        .stub(dbContext, 'query');

      let data = [[true,1],[false,0]];
      for (let i = 0; i < data.length; i++) {
        let ruleSet = new Models.Rules.RuleSet(0, 'Rule Set 4', undefined, data[i][0]);
        let query = 'insert into RULESET (ID, NAME, STOPPROCESSINGONFAIL) values (RULESET_ID_SEQ.nextval, :name, :stop_on_fail) returning ID into :inserted_id';
        let queryParams = { name: 'Rule Set 4', stop_on_fail: data[i][1], inserted_id: 0 };

        await ruleSetRepository.insert(ruleSet);

        sinon.assert.calledWith(dbContextStub, query, queryParams);
      }
    });

    it('should return the created rule set', async () => {
      let ruleSet = new Models.Rules.RuleSet(0, 'Rule Set 4', undefined, true);

      let dbContextStub = sinon
        .stub(dbContext, 'query')
        .returns(Promise.resolve({
          outBinds: { inserted_id: [4] },
          metaData: [ { name: 'ID' } ]
        }));

      let expected = new Models.Rules.RuleSet(4, 'Rule Set 4', undefined, true);
      let actual = await ruleSetRepository.insert(ruleSet);

      assert.deepStrictEqual(actual, expected, 'The returned rule set was not the expected value');
    });
  });
});
