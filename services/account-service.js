"use strict";

const account = require('../models/account');

module.exports = class AccountService {
  constructor(accountRepository) {
    this._accountRepository = accountRepository;
  }

  isAccountLocked(accountId) {
    let account = this._accountRepository.selectById(accountId);
    return account.IsLocked;
  }
};
