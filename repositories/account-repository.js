"use strict";

const Models = require('../models');

module.exports = class AccountRepository {
  constructor(dbContext) {
    this._dbContext = dbContext;
  }

  async selectById(accountId) {
    let query = "select collector_num, lock_status from ACCOUNT_EV_ST where collector_num = :id";
    let params = { id: accountId };
    let result = await this._dbContext.query(query, params);

    let account = null;
    if (result != null && result.rows.length > 0) {
      account = new Models.Account();
      account.Id = result.rows[0][0];
      account.IsLocked = result.rows[0][1] == 1;
    }

    return account;
  }
};
