import { Logger } from 'pino';
import * as brevo from '@getbrevo/brevo';
import assert = require('assert');

export class MailRepository {
  private _apiInstance = new brevo.TransactionalEmailsApi();

  constructor(private _options: { logger: Logger }) {
    assert(process.env.BREVO_API_KEY, 'Env var BREVO_API_KEY is required');
    assert(process.env.OMNISTRATE_RESOURCE_ID, 'Env var OMNISTRATE_RESOURCE_ID is required');
    //@ts-expect-error issue with the lib itseld
    const apiKey = this._apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
  }
  async sendInstanceStoppedEmail(email: string, instanceId: string): Promise<void> {
    assert(email, 'MailRepository: Email is required');
    if (process.env.DRY_RUN === '1') {
      return;
    }

    const link = `https://app.falkordb.cloud/access/${process.env.OMNISTRATE_SERVICE_ID}/${process.env.OMNISTRATE_ENVIRONMENT_ID}/${process.env.OMNISTRATE_RESOURCE_ID}/${instanceId}?productTierId=${process.env.OMNISTRATE_PRODUCT_TIER_ID}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.SENDER_EMAIL || 'noreply@falkordb.cloud', name: 'FalkorDB Cloud' };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Your FalkorDB instance has been stopped';
    sendSmtpEmail.htmlContent = `<p>Your FalkorDB instance with ID ${instanceId} has been stopped due to inactivity. You can start it again from the <a href="${link}">FalkorDB dashboard</a>.</p>`;
    sendSmtpEmail.replyTo = { email: process.env.REPLY_TO_EMAIL || 'info@falkordb.com', name: 'FalkorDB Support' };

    await this._apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
