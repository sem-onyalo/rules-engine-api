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
      account.Id = this._dbContext.getValueFromResultSet(result, 'COLLECTOR_NUM');
      account.IsLocked = this._dbContext.getValueFromResultSet(result, 'LOCK_STATUS') == 1;
    }

    return account;
  }
};
