import { Logger } from 'pino';
import * as brevo from '@getbrevo/brevo';
import assert = require('assert');
import { readFileSync } from 'fs';
import { join } from 'path';
import mjml2html from 'mjml';

const DEFAULT_TEMPLATES = {
  'instance-stopped': `<mjml>
  <mj-head>
    <mj-title>Your instance has been stopped</mj-title>
    <mj-preview>Your instance has been stopped</mj-preview>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-all>
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"></mj-text>
    </mj-attributes>
    <mj-style inline="inline">
      .body-section {
      -webkit-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      -moz-box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      box-shadow: 1px 4px 11px 0px rgba(0, 0, 0, 0.15);
      }
    </mj-style>
    <mj-style inline="inline">
      .text-link {
      color: #5e6ebf
      }
    </mj-style>
    <mj-style inline="inline">
      .footer-link {
      color: #888888
      }
    </mj-style>

  </mj-head>
  <mj-body background-color="#E7E7E7" width="600px">
    <mj-section full-width="full-width" background-color="#7466FF" padding-bottom="10px">
      <mj-column width="100%">
        <mj-image src="https://www.falkordb.com/wp-content/uploads/2024/02/logo-light.svg" alt="" align="center" width="150px" />
    	</mj-column>
    </mj-section>
    <mj-wrapper padding-top="0" padding-bottom="0" css-class="body-section">
      <mj-section background-color="#ffffff" padding-left="15px" padding-right="15px">
        <mj-column width="100%">
          <mj-text color="#212b35" font-weight="bold" font-size="20px">
            Your instance has been stopped :(
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            Hi {{ name }},
          </mj-text>
          <mj-text color="#637381" font-size="16px">
            Your FalkorDB instance with ID <b>{{ instanceId }}</b> has been stopped due to inactivity. 
            <br>
            You can start it again from the FalkorDB Cloud Dashboard.
          </mj-text>
        
          <mj-button background-color="#7466FF" align="center" color="#ffffff" font-size="17px" font-weight="bold" href="{{ link }}" width="300px">
            Dashboard
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-wrapper>

    <mj-wrapper full-width="full-width">
      <mj-section>
        <mj-column width="100%" padding="0">
          <mj-social font-size="15px" icon-size="30px" mode="horizontal" padding="0" align="center">
            <mj-social-element name="twitter" href="https://x.com/falkordb" background-color="#A1A0A0">
            </mj-social-element>
            <mj-social-element name="linkedin" href="https://linkedin.com/company/falkordb" background-color="#A1A0A0">
            </mj-social-element>
          </mj-social>
          <mj-text color="#445566" font-size="11px" align="center" line-height="16px">
            &copy; FalkorDB, All Rights Reserved.
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding-top="0">
        <mj-group>
          <mj-column width="100%" padding-right="0">
            <mj-text color="#445566" font-size="11px" align="center" line-height="16px" font-weight="bold">
              <a class="footer-link" href="https://www.falkordb.com/privacy-policy/">Privacy</a>
            </mj-text>
          </mj-column>
        </mj-group>

      </mj-section>
    </mj-wrapper>

  </mj-body>
</mjml>`,
};

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

  private async _interpolateTemplate(templateName: 'instance-stopped', vars: { [key: string]: string }) {
    // Load template.
    const tpl = this._getTemplate(templateName) ?? DEFAULT_TEMPLATES[templateName];

    if (!tpl) {
      throw new Error(`MailRepository: Template ${templateName} not found`);
    }

    // Render.
    const mjmlResult = await mjml2html(tpl);
    let html = mjmlResult.html;

    if (!html) {
      throw new Error(`MailRepository: Failed to render template ${templateName}`);
    }

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

    sendSmtpEmail.htmlContent = await this._interpolateTemplate('instance-stopped', { instanceId, name, link });
    await this._apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}
