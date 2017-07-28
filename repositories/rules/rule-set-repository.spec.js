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

  describe('selectById(id)', () => {
    it('should export function', () => {
      expect(ruleSetRepository.selectById).to.be.a('function');
    });
  });

  describe('selectByRuleSetId(args)', () => {
    it('should export function', () => {
      expect(ruleSetRepository.selectByRuleSetId).to.be.a('function');
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

      let result = await ruleSetRepository.selectByRuleSetId(1);
      assert.deepStrictEqual(result, expectedRuleSet);
    });
  });
});
