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
      blockItem.Id = this._dbContext.getValueFromResultSet(result, 'ID');
      blockItem.Type = this._dbContext.getValueFromResultSet(result, 'TYPE_ID');
      blockItem.Value = this._dbContext.getValueFromResultSet(result, 'VALUE');
    }

    return blockItem;
  }
};
