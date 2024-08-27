import { Logger } from 'pino';
import * as brevo from '@getbrevo/brevo';
import assert = require('assert');
import { readFileSync } from 'fs';
import { join } from 'path';
import mjml2html from 'mjml';

export class MailRepository {
  private _apiInstance = new brevo.TransactionalEmailsApi();

  constructor(private _options: { logger: Logger }) {
    assert(process.env.BREVO_API_KEY, 'Env var BREVO_API_KEY is required');
    assert(process.env.OMNISTRATE_RESOURCE_ID, 'Env var OMNISTRATE_RESOURCE_ID is required');
    //@ts-expect-error issue with the lib itseld
    const apiKey = this._apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
  }

  private _getTemplate(templateName: string) {
    return readFileSync(join(__dirname, '../../assets/templates', `${templateName}.mjml`), 'utf8');
  }

  private _interpolateTemplate(templateName: 'instance-stopped', vars: { [key: string]: string }) {
    // Load template.
    const tpl = this._getTemplate(templateName);

    // Render.
    let html = mjml2html(tpl).html;

    // Interpolate variables.
    for (const prop in vars) {
      html = html.replace(new RegExp(`{{( )?${prop}( )?}}`, 'g'), vars[prop]);
    }

    return html;
  }

  async sendInstanceStoppedEmail(email: string, name: string, instanceId: string): Promise<void> {
    assert(email, 'MailRepository: Email is required');
    if (process.env.DRY_RUN === '1') {
      return;
    }

    const link = `https://app.falkordb.cloud/access/${process.env.OMNISTRATE_SERVICE_ID}/${process.env.OMNISTRATE_ENVIRONMENT_ID}/${process.env.OMNISTRATE_RESOURCE_ID}/${instanceId}?productTierId=${process.env.OMNISTRATE_PRODUCT_TIER_ID}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.SENDER_EMAIL || 'noreply@falkordb.cloud', name: 'FalkorDB Cloud' };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Your FalkorDB instance has been stopped';
    sendSmtpEmail.replyTo = { email: process.env.REPLY_TO_EMAIL || 'info@falkordb.com', name: 'FalkorDB Support' };

    sendSmtpEmail.htmlContent = this._interpolateTemplate('instance-stopped', { instanceId, name, link });
    await this._apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
