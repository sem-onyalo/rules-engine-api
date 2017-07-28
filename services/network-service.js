"use strict";

const Models = require('../models');

module.exports = class NetworkService {
  constructor(blockItemRepository) {
    this._blockItemRepository = blockItemRepository;
  }

  async isEmailBlocked(email) {
    let blockitem = await this._blockItemRepository.selectByTypeAndValue(Models.BlockItemType.Email, email);
    return blockitem != null;
  }
}
