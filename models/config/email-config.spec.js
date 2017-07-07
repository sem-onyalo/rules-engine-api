"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;

const EmailConfig = require('./email-config');

describe('EmailConfig', () => {
  describe('Keys', () => {
    it('should define an object of keys', () => {
      expect(EmailConfig.Keys).to.be.an('object');
    });

    it('should define the key EMAIL with the value "Email"', () => {
      expect(EmailConfig.Keys.EMAIL).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.EMAIL, 'Email', 'EMAIL config key not expected value');
    });

    it('should define the key SMTP_HOST with value "SmtpHost"', () => {
      expect(EmailConfig.Keys.SMTP_HOST).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_HOST, 'SmtpHost', 'SMTP_HOST config key not expected value');
    });

    it('should define the key SMTP_PORT with value "SmtpPort"', () => {
      expect(EmailConfig.Keys.SMTP_PORT).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_PORT, 'SmtpPort', 'SMTP_PORT config key not expected value');
    });

    it('should define the key SMTP_SECURE with value "SmtpSecure"', () => {
      expect(EmailConfig.Keys.SMTP_SECURE).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_SECURE, 'SmtpSecure', 'SMTP_SECURE config key not expected value');
    });

    it('should define the key SMTP_USER with value "SmtpUser"', () => {
      expect(EmailConfig.Keys.SMTP_USER).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_USER, 'SmtpUser', 'SMTP_USER config key not expected value');
    });

    it('should define the key SMTP_PASS with value "SmtpPass"', () => {
      expect(EmailConfig.Keys.SMTP_PASS).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_PASS, 'SmtpPass', 'SMTP_PASS config key not expected value');
    });

    it('should define the key SMTP_FROM with value "SmtpFrom"', () => {
      expect(EmailConfig.Keys.SMTP_FROM).to.be.a('string');
      assert.strictEqual(EmailConfig.Keys.SMTP_FROM, 'SmtpFrom', 'SMTP_FROM config key not expected value');
    });
  });
});
