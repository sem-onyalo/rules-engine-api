"use strict";

const Models = require('../models');
const Repositories = require('../repositories');
const AccountService = require('./account-service');

const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('AccountService', () => {
  let accountRepository;
  let accountService;

  beforeEach(function () {
    accountRepository = new Repositories.AccountRepository();
    accountService = new AccountService(accountRepository);
  });

  it('should not be null', () => {
    assert.isNotNull(accountService, 'AccountService instance is null');
  });

  describe('isAccountLocked(accountId)', () => {

    it('should export function', () => {
      expect(accountService.isAccountLocked).to.be.a('function');
    });

    it('should get account from repostitory and return false', () => {
      let isLocked = false;

      let selectAccountByIdStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(new Models.Account(123, isLocked)));

      let actual = accountService.isAccountLocked();

      sinon.assert.calledOnce(selectAccountByIdStub);
      return expect(actual).to.eventually.equal(isLocked);
    });

    it('should get account from repostitory and return true', () => {
      let isLocked = true;

      let selectAccountByIdStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(new Models.Account(123, isLocked)));

      let actual = accountService.isAccountLocked();

      sinon.assert.calledOnce(selectAccountByIdStub);
      return expect(actual).to.eventually.equal(isLocked);
    });

    it('should return false if account does not exist in repository', () => {
      let selectAccountByIdStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(Promise.resolve(null));

      let actual = accountService.isAccountLocked(123);
      return expect(actual).to.eventually.equal(false);
    });
  });
});
