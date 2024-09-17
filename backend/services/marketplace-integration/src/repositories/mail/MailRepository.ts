import { FastifyBaseLogger } from 'fastify';
import * as brevo from '@getbrevo/brevo';
import assert = require('assert');
import { readFileSync } from 'fs';
import { join } from 'path';
import mjml2html from 'mjml';
import { IMailRepository } from './IMailRepository';

export class MailRepository implements IMailRepository {
  private _apiInstance = new brevo.TransactionalEmailsApi();

  constructor(
    _brevoApiKey: string,
    private _opts: {
      dryRun?: boolean;
      logger: FastifyBaseLogger;
    },
  ) {
    assert(_brevoApiKey, 'Brevo api key is required');
    //@ts-expect-error issue with the lib
    const apiKey = this._apiInstance.authentications['apiKey'];
    apiKey.apiKey = _brevoApiKey;
  }

  private _getTemplate(templateName: string) {
    return readFileSync(join(__dirname, '../../assets/templates', `${templateName}.mjml`), 'utf8');
  }

  private _interpolateTemplate(templateName: 'free-instance-created', vars: { [key: string]: string }) {
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

  async sendFreeInstanceCreatedEmail(params: {
    email: string;
    instanceId: string;
    omnistrateServiceId: string;
    omnistrateEnvironmentId: string;
    omnistrateFreeResourceId: string;
    omnistrateFreeTierId: string;
    username: string;
    password: string;
  }): Promise<void> {
    assert(params.email, 'MailRepository: Email is required');

    this._opts.logger.info({ ...params, password: undefined }, 'Sending free instance created email');

    if (this._opts.dryRun) {
      return;
    }

    const link = `https://app.falkordb.cloud/access/${params.omnistrateServiceId}/${params.omnistrateEnvironmentId}/${params.omnistrateFreeResourceId}/${params.instanceId}?productTierId=${params.omnistrateFreeTierId}`;

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: process.env.SENDER_EMAIL || 'noreply@falkordb.cloud', name: 'FalkorDB Cloud' };
    sendSmtpEmail.to = [{ email: params.email }];
    sendSmtpEmail.subject = 'Your free FalkorDB instance will be ready shortly';
    sendSmtpEmail.replyTo = { email: process.env.REPLY_TO_EMAIL || 'info@falkordb.com', name: 'FalkorDB Support' };

    sendSmtpEmail.htmlContent = this._interpolateTemplate('free-instance-created', {
      instanceId: params.instanceId,
      link,
      username: params.username,
      password: params.password,
    });
    await this._apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
