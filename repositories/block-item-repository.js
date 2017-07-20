"use strict";

const Models = require('../models');

module.exports = class BlockItemRepository {
  constructor(dbContext) {
    this._dbContext = dbContext;
  }

  async selectByTypeAndValue(type, value) {
    let query = 'select id, type_id, value from BLACKLIST_VALUES where type_id = :type and value = :value';
    let params = { type: type, value: value };
    let result = await this._dbContext.query(query, params);

    let blockItem = null;
    if (result != null && result.rows.length > 0) {
      blockItem = new Models.BlockItem();
      blockItem.Id = result.rows[0][0];
      blockItem.Type = result.rows[0][1];
      blockItem.Value = result.rows[0][2];
    }

    return blockItem;
  }
};
