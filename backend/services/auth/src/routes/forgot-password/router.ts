import fp from 'fastify-plugin';
import { SendForgotPasswordRequestBodySchema } from '@falkordb/schemas/services/auth/v1';
import { sendForgotPasswordHandler } from './handlers/send';

export default fp(
  async function signUp(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      if (request.routerPath.startsWith('/forgot-password')) await fastify.validateCaptcha(request);
    });

    fastify.post(
      '/forgot-password',
      {
        schema: {
          tags: ['forgot-password'],
          body: SendForgotPasswordRequestBodySchema,
        },
      },
      sendForgotPasswordHandler,
    );
  },
  {
    name: 'forgot-password-routes',
  },
);
