import {
  SignUpWithEmailRequestBodySchema,
  SignUpWithEmailResponseSuccessSchema,
} from '@falkordb/schemas/dist/services/auth/v1';
import fp from 'fastify-plugin';
import { signupWithEmailHandler } from './handlers/signupWithEmailHandler';

export default fp(
  async function signUp(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      if (request.routerPath.startsWith('/signup')) await fastify.validateCaptcha(request);
    });

    fastify.post(
      '/signup/email',
      {
        schema: {
          tags: ['signup'],
          body: SignUpWithEmailRequestBodySchema,
          response: {
            200: SignUpWithEmailResponseSuccessSchema,
          },
        },
      },
      signupWithEmailHandler,
    );
  },
  {
    name: 'signup-routes',
  },
);
