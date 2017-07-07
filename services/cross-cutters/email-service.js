"use strict";

const Config = require('../../models/config');

module.exports = class EmailService {
  constructor(configService, mailerService) {
    this._configService = configService;
    this._mailerService = mailerService;
  }

  sendEmail(body, subject, to, from, host, port, secure, user, pass) {
    if(arguments.length == 3) {
      host = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_HOST);
      port = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_PORT);
      secure = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_SECURE);
      user = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_USER);
      pass = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_PASS);
      from = this._configService.getSetting(Config.Email.Keys.EMAIL, Config.Email.Keys.SMTP_FROM);
    }

    let createTransportRequest = {
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: user,
        pass: pass
      }
    }

    let transport = this._mailerService.createTransport(createTransportRequest);

    let sendMailRequest = {
      from: from,
      to: to,
      subject: subject,
      text: body
    };

    transport.sendMail(sendMailRequest, (error, info) => {
      if (error) {
        //TODO log error
      }

      //TODO log email sent in debug mode
    });
  }
}
