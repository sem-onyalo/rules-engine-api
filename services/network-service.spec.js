"use strict";

const Models = require('../models');
const Repositories = require('../repositories');
const NetworkService = require('./network-service');

const expect = require('chai').expect;
const assert = require('chai').assert;
const sinon = require('sinon');

describe('NetworkService', () => {
  let blockItemRepository;
  let networkService;

  beforeEach(function () {
    blockItemRepository = new Repositories.BlockItemRepository();
    networkService = new NetworkService(blockItemRepository);
  });

  it('should not be null', () => {
    assert.isNotNull(networkService, 'NetworkService instance is null');
  });

  describe('isEmailBlocked(email)', () => {
    it('should export function', () => {
      expect(networkService.isEmailBlocked).to.be.a('function');
    });

    it('should get block item from repository and return true', async () => {
      let selectBlockItemByTypeAndValueStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(Promise.resolve(new Models.BlockItem(123, Models.BlockItemType.Email, 'jdoe@nomail.com')));

      let email = 'jdoe@nomail.com';
      let actual = await networkService.isEmailBlocked(email);

      selectBlockItemByTypeAndValueStub.restore();

      sinon.assert.calledOnce(selectBlockItemByTypeAndValueStub);
      sinon.assert.calledWith(selectBlockItemByTypeAndValueStub, Models.BlockItemType.Email, email);
      assert.isTrue(actual, 'isEmailBlocked() did not return expected value of true');
    });

    it('should get null from repository and return false', async () => {
      let selectBlockItemByTypeAndValueStub = sinon
        .stub(blockItemRepository, 'selectByTypeAndValue')
        .returns(Promise.resolve(null));

      let email = 'jdoe@nomail.com';
      let actual = await networkService.isEmailBlocked(email);

      selectBlockItemByTypeAndValueStub.restore();

      sinon.assert.calledOnce(selectBlockItemByTypeAndValueStub);
      sinon.assert.calledWith(selectBlockItemByTypeAndValueStub, Models.BlockItemType.Email, email);
      assert.isFalse(actual, 'isEmailBlocked() did not return expected value of false');
    });
  });
});
