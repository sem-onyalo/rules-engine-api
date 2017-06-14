"use strict";

const Models = require('../models');

module.exports = class NetworkService {
  constructor(blockItemRepository) {
    this._blockItemRepository = blockItemRepository;
  }

  isEmailBlocked(email) {
    let blockitem = this._blockItemRepository.selectByTypeAndValue(Models.BlockItemType.Email, email);
    return blockitem != null;
  }
}
