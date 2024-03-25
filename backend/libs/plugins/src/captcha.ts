import fp from 'fastify-plugin';
import {
  type RawServerDefault,
  type FastifyPluginCallback,
  type FastifyTypeProviderDefault,
  type FastifyBaseLogger,
  type FastifyRequest,
} from 'fastify';
import { ApiError } from '@falkordb/errors';

interface ICaptchaPluginOptions {
  captchaRepository: {
    verify: (token: string) => Promise<boolean>;
  };
  fieldName?: string;
}

const DEFAULT_CAPTCHA_FIELD_NAME = 'g-recaptcha-response';

export default fp<ICaptchaPluginOptions>(
  async (fastify, opts) => {
    fastify.decorate('validateCaptcha', async (request: FastifyRequest) => {
      try {
        const token =
          request.body?.[opts.fieldName ?? DEFAULT_CAPTCHA_FIELD_NAME] ??
          request.query?.[opts.fieldName ?? DEFAULT_CAPTCHA_FIELD_NAME];
        if (!token) {
          throw ApiError.badRequest('Captcha token is missing', 'CAPTCHA_TOKEN_MISSING');
        }

        const isCaptchaValid = await opts.captchaRepository.verify(token);
        if (!isCaptchaValid) {
          throw ApiError.badRequest('Invalid captcha token', 'INVALID_CAPTCHA_TOKEN');
        }
      } catch (error) {
        if (error instanceof ApiError) {
          throw error.toFastify(request.server);
        }

        throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
      }
    });
  },
  {
    name: 'captcha-plugin',
  },
) as FastifyPluginCallback<ICaptchaPluginOptions, RawServerDefault, FastifyTypeProviderDefault, FastifyBaseLogger>;
