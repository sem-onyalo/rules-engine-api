"use strict";

const AccountRepository = require('./account-repository');
const DbContext = require('./db-context');
const Models = require('../models');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('AccountRepository', () => {
  let dbContext;
  let accountRepository;

  beforeEach(() => {
    dbContext = new DbContext();
    accountRepository = new AccountRepository(dbContext);
  });

  describe('selectById()', () => {
    let dataSet = {
      rows: [ [ 123, 0 ] ],
      metaData: [ { name: 'COLLECTOR_NUM' }, { name: 'LOCK_STATUS' } ]
    };

    it('should export function', () => {
      expect(accountRepository.selectById).to.be.a('function');
    });

    it('should call dbContext and return an instance of Account', async () => {
      let dbContextStub = sinon.stub(dbContext, 'query')
        .returns(Promise.resolve(dataSet));

      let accountId = 123;
      let expectedQuery = 'select COLLECTOR_NUM, LOCK_STATUS from ACCOUNT_EV_ST where COLLECTOR_NUM = :id';
      let expectedQueryParams = { id: accountId };
      let expectedResult  = new Models.Account();
      expectedResult.Id = accountId;
      expectedResult.IsLocked = false;

      let result = await accountRepository.selectById(accountId);

      sinon.assert.calledOnce(dbContextStub);
      sinon.assert.calledWith(dbContextStub, expectedQuery, expectedQueryParams);
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});
