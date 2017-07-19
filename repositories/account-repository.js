"use strict";

module.exports = class AccountRepository {
  constructor(dbContext) {
    this._dbContext = dbContext;
  }

  async selectById(accountId) {
    let query = 'select collector_num, lock_status from ACCOUNT_EV_ST where collector_num = :id';
    let params = { id: accountId };
    let result = await this._dbContext.query(query, params);
    return result;
  }
};
