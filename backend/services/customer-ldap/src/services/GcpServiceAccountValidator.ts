import { OAuth2Client } from 'google-auth-library';
import { FastifyBaseLogger } from 'fastify';
import { ApiError } from '@falkordb/errors';

export interface GcpServiceAccountValidatorOptions {
  logger: FastifyBaseLogger;
  adminServiceAccountEmail?: string;
}

export class GcpServiceAccountValidator {
  private _oauth2Client: OAuth2Client;
  private _adminServiceAccountEmail?: string;

  constructor(private _options: GcpServiceAccountValidatorOptions) {
    this._oauth2Client = new OAuth2Client();
    this._adminServiceAccountEmail = _options.adminServiceAccountEmail;
  }

  async validateServiceAccountToken(token: string): Promise<boolean> {
    if (!this._adminServiceAccountEmail) {
      this._options.logger.debug('GCP admin service account email not configured');
      return false;
    }

    try {
      const ticket = await this._oauth2Client.verifyIdToken({
        idToken: token,
        audience: undefined, // We'll validate the email claim instead
      });

      const payload = ticket.getPayload();
      if (!payload) {
        this._options.logger.debug('No payload in token');
        return false;
      }

      // Check if the token is for the configured admin service account
      const email = payload.email;
      if (email !== this._adminServiceAccountEmail) {
        this._options.logger.debug(
          {
            tokenEmailPresent: Boolean(email),
            expectedEmailConfigured: Boolean(this._adminServiceAccountEmail),
          },
          'Token email does not match configured admin service account email',
        );
        return false;
      }

      // Verify the email is verified (for service accounts this should always be true)
      if (!payload.email_verified) {
        this._options.logger.debug('Email not verified in token');
        return false;
      }

      this._options.logger.info({ email }, 'GCP service account token validated successfully');
      return true;
    } catch (error) {
      this._options.logger.debug({ err: error }, 'Error validating GCP service account token');
      return false;
    }
  }

  getAdminServiceAccountEmail(): string | undefined {
    return this._adminServiceAccountEmail;
  }
}
