"use strict";

const Models = require('../models');
const Repositories = require('../repositories');
const AccountService = require('./account-service');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

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
        .returns(new Models.Account(123, isLocked));

      let actual = accountService.isAccountLocked();

      selectAccountByIdStub.restore();

      sinon.assert.calledOnce(selectAccountByIdStub);
      assert.strictEqual(actual, isLocked, 'AccountService.IsAccountLocked() does not strictly equal false');
    });

    it('should get account from repostitory and return true', () => {
      let isLocked = true;

      let selectAccountByIdStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(new Models.Account(123, isLocked));

      let actual = accountService.isAccountLocked();

      selectAccountByIdStub.restore();

      sinon.assert.calledOnce(selectAccountByIdStub);
      assert.strictEqual(actual, isLocked, 'AccountService.IsAccountLocked() does not strictly equal true');
    });

    it('should return false if account does not exist in repository', () => {
      let selectAccountByIdStub = sinon
        .stub(accountRepository, 'selectById')
        .returns(null);

      let actual = accountService.isAccountLocked(123);
      assert.strictEqual(actual, false, 'Should return false if account does not exist in repository');
    });
  });
});
