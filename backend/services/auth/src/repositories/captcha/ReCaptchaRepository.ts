import { FastifyBaseLogger } from 'fastify';
import { ICaptchaRepository } from './ICaptchaRepository';
import axios from 'axios';

export class ReCaptchaRepository implements ICaptchaRepository {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
      secretKey: string;
    },
  ) {}

  async verify(token: string): Promise<boolean> {
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: this._opts.secretKey,
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
