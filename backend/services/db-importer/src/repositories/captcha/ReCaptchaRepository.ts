import { FastifyBaseLogger } from 'fastify';
import { ICaptchaRepository } from './ICaptchaRepository';
import axios from 'axios';
import assert from 'assert';

export class ReCaptchaRepository implements ICaptchaRepository {
  constructor(
    private secretKey: string,
    private _opts: {
      logger: FastifyBaseLogger;
    },
  ) {
    assert(this.secretKey, 'ReCaptcha:secretKey is required');
  }

  async verify(token: string): Promise<boolean> {
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: this.secretKey,
          response: token,
        },
      });
      return !!response?.data?.success;
    } catch (error) {
      this._opts.logger.error(error);
      return false;
    }
  }
}
