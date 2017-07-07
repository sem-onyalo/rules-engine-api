"use strict";

const assert = require('chai').assert;
const expect = require('chai').expect;
const sinon = require('sinon');

const Config = require('../../models/config');
const ConfigService = require('./config-service');
const EmailService = require('./email-service');
const NodeMailer = require('nodemailer');

describe('EmailService', () => {
  let emailHost = 'smtp.nomail.com', emailPort = 465, emailSecure = true;
  let emailUser = 'smtpuser@nomail.com', emailPass = 'password', emailFrom = 'no-reply@nomail.com';
  let emailBody = 'This is a unit test for the email service';
  let emailSubject = 'Email Service Unit Test';
  let emailTo = 'jdoe@nomail.com';

  let configService;
  let emailService;

  beforeEach(function() {
    configService = new ConfigService();
    emailService = new EmailService(configService, NodeMailer);
  });

  describe('sendEmail(body, subject, to, from, host, port, secure, user, pass)', () => {
    it('should export function', () => {
      expect(emailService.sendEmail).to.be.a('function');
    });

    it('should send an email using the provided arguments', () => {

      let transportStub = { sendMail: function(mailOptions, callback){ } };
      let createTransportStub = sinon
        .stub(NodeMailer, 'createTransport')
        .returns(transportStub);

      let sendMailStub = sinon.stub(transportStub, 'sendMail');

      let createTransportRequest = {
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

      let sendMailRequest = {
        from: emailFrom,
        to: emailTo,
        subject: emailSubject,
        text: emailBody
      };

      emailService.sendEmail(emailBody, emailSubject, emailTo, emailFrom, emailHost, emailPort, emailSecure, emailUser, emailPass);

      createTransportStub.restore();
      sendMailStub.restore();

      sinon.assert.calledOnce(createTransportStub);
      sinon.assert.calledWith(createTransportStub, createTransportRequest);
      sinon.assert.calledOnce(sendMailStub);
      sinon.assert.calledWith(sendMailStub, sendMailRequest);
    });

    it('should send an email using from, host, port, secure, user and pass from config if not provided', () => {

      let getConfigSettingStub = sinon.stub(configService, 'getSetting');
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_HOST)
        .returns(emailHost);
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_PORT)
        .returns(emailPort);
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_SECURE)
          .returns(emailSecure);
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_USER)
        .returns(emailUser);
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_PASS)
        .returns(emailPass);
      getConfigSettingStub
        .withArgs(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_FROM)
        .returns(emailFrom);

      let transportStub = { sendMail: function(mailOptions, callback){ } };
      let createTransportStub = sinon
        .stub(NodeMailer, 'createTransport')
        .returns(transportStub);

      let sendMailStub = sinon.stub(transportStub, 'sendMail');

      let createTransportRequest = {
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      };

      let sendMailRequest = {
        from: emailFrom,
        to: emailTo,
        subject: emailSubject,
        text: emailBody
      };

      emailService.sendEmail(emailBody, emailSubject, emailTo);

      createTransportStub.restore();
      sendMailStub.restore();

      sinon.assert.callCount(getConfigSettingStub, 6);
      sinon.assert.calledWith(createTransportStub, createTransportRequest);
      sinon.assert.calledWith(sendMailStub, sendMailRequest);
    });
  });
});
