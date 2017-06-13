"use strict";

const Models = require('../models');
const Repositories = require('../repositories');
const AccountService = require('./account-service');

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

describe('Account service', () => {
  let accountRepository;
  let accountService;

  describe('isAccountLocked', () => {
    beforeEach(function () {
      accountRepository = new Repositories.AccountRepository();
      accountService = new AccountService(accountRepository);
    });

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
  });
});
