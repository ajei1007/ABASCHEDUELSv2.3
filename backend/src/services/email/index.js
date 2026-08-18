const config = require('../../config');
const assert = require('assert');
const nodemailer = require('nodemailer');
const logger = require('../../services/logger/logger');

module.exports = class EmailSender {
  async send({ email, companyId, payload }) {
    if (!EmailSender.isConfigured) {
      console.error(
        `Email provider is not configured. Please configure it at backend/config/<environment>.json.`,
      );
      return;
    }

    assert(email, 'email is required');
    assert(email.to, 'email.to is required');
    assert(email.subject, 'email.subject is required');
    assert(email.html, 'email.html is required');

    let emailLogsInfo;

    try {
      const transporter = nodemailer.createTransport(
        this.transportConfig,
      );

      const mailOptions = {
        from: this.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
      };

      emailLogsInfo = {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        htmlLength: mailOptions.html?.length || 0,
        timestamp: new Date().toISOString(),
        companyId,
        payload,
      }

      const result = await transporter.sendMail(mailOptions);
      logger.logEmail('info', emailLogsInfo);

      return result;
    } catch (error) {
      console.error('Error sending single email ... ', error);
      logger.logEmail('error', { error, emailLogsInfo });
    }
  }

  async sendMultiple({
    emails, // emails (string) -> 'abc@mail.com, xyz@mail.com'
    subject, // string
    message, // string or html
    cc, // emails (string) -> 'abc@mail.com, xyz@mail.com'
    bcc, // emails (string) -> 'abc@mail.com, xyz@mail.com'
    replyTo, // emails (string) -> 'abc@mail.com, xyz@mail.com',
    attachments,
    companyId,
    payload,
  }) {
    if (!EmailSender.isConfigured) {
      console.error(
        `Email provider is not configured. Please configure it at backend/config/<environment>.json.`,
      );
      return;
    }

    let emailLogsInfo;

    try { 
      const transporter = nodemailer.createTransport(
        this.transportConfig,
      );

      const mailOptions = {
        from: this.from,
        to: emails,
        subject,
        html: message,
        attachments
      };

      if (cc) mailOptions.cc = cc;
      if (bcc) mailOptions.bcc = bcc;
      if (replyTo) mailOptions.replyTo = replyTo;

      emailLogsInfo = {
        from: mailOptions.from,
        to: mailOptions.to,
        cc: mailOptions.cc,
        bcc: mailOptions.bcc,
        replyTo: mailOptions.replyTo,
        subject: mailOptions.subject,
        attachments: mailOptions.attachments ? mailOptions.attachments.length : 0,
        htmlLength: mailOptions.html?.length || 0,
        timestamp: new Date().toISOString(),
        companyId,
        payload,
      }

      const result = await transporter.sendMail(mailOptions);
      logger.logEmail('info', emailLogsInfo);

      return result;
    } catch (error) {
      console.error('Error sending multiple emails ... ', error);
      logger.logEmail('error', { error, emailLogsInfo });
    }
  }

  static get isConfigured() {
    return !!config.email && !!config.email.host;
  }

  get transportConfig() {
    return config.email;
  }

  get from() {
    return config.email.from;
  }
};
