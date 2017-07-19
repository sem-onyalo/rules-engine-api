"use strict";

module.exports = class AccountService {
  constructor(accountRepository) {
    this._accountRepository = accountRepository;
  }

  async isAccountLocked(accountId) {
    let account = await this._accountRepository.selectById(accountId);
    return account !== null ? account.IsLocked : false;
  }
};
