import { VerifyTokenRequestQuerySchema } from '@falkordb/schemas/dist/services/auth/v1';
import fp from 'fastify-plugin';
import { verifyTokenHandler } from './handlers/verify';

export default fp(
  async function signUp(fastify, opts) {
    fastify.get(
      '/verify-token',
      {
        schema: {
          tags: ['verify-token'],
          querystring: VerifyTokenRequestQuerySchema,
        },
      },
      verifyTokenHandler,
    );
  },
  {
    name: 'verify-token-routes',
  },
);
