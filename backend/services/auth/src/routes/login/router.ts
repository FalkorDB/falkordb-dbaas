import {
  LoginWithEmailRequestBodySchema,
  LoginWithEmailResponseSuccessSchema,
} from '@falkordb/schemas/dist/services/auth/v1';
import fp from 'fastify-plugin';
import { loginWithEmailHandler } from './handlers/loginWithEmailHandler';

export default fp(
  async function login(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      if (request.routerPath.startsWith('/login')) await fastify.validateCaptcha(request);
    });

    fastify.post(
      '/login/email',
      {
        schema: {
          tags: ['login'],
          body: LoginWithEmailRequestBodySchema,
          response: {
            200: LoginWithEmailResponseSuccessSchema,
          },
        },
      },
      loginWithEmailHandler,
    );
  },
  {
    name: 'login-routes',
  },
);
