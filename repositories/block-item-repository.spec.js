"use strict";

const BlockItemRepository = require('./block-item-repository');
const DbContext = require('./db-context');
const Models = require('../models');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('BlockItemRepository', () => {
  let dbContext;
  let blockItemRepository;

  beforeEach(() => {
    dbContext = new DbContext();
    blockItemRepository = new BlockItemRepository(dbContext);
  });

  describe('selectByTypeAndValue(type, value)', () => {
    let dataSet = {
      rows: [ [ 1, 1, 'jdoe@nomail.com' ] ],
      metaData: [ { name: 'ID' }, { name: 'TYPE_ID' }, { name: 'VALUE' } ]
    };

    it('should export function', () => {
      let blockItemRepository = new BlockItemRepository();
      expect(blockItemRepository.selectByTypeAndValue).to.be.a('function');
    });

    it('should call dbContext and return an instance of BlockItem', async () => {
      let dbContextStub = sinon.stub(dbContext, 'query')
        .returns(Promise.resolve(dataSet));

      let blockItemId = 123, blockItemType = 1, blockItemValue = 'jdoe@nomail.com';
      let expectedQuery = 'select ID, TYPE_ID, VALUE from BLACKLIST_VALUES where TYPE_ID = :type and VALUE = :value';
      let expectedQueryParams = { type: blockItemType, value: blockItemValue };
      let expectedResult  = new Models.BlockItem();
      expectedResult.Id = 1;
      expectedResult.Type = blockItemType;
      expectedResult.Value = blockItemValue;

      let result = await blockItemRepository.selectByTypeAndValue(blockItemType, blockItemValue);

      sinon.assert.calledOnce(dbContextStub);
      sinon.assert.calledWith(dbContextStub, expectedQuery, expectedQueryParams);
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});
