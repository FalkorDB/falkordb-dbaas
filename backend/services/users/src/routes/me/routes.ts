import fp from 'fastify-plugin';
import { GetMeRequestHeadersSchema, GetMeResponseBodySchema } from './schemas/me';
import { getMeHandler } from './handlers/get';

export default fp(
  async function me(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['me'],
          headers: GetMeRequestHeadersSchema,
          response: {
            200: GetMeResponseBodySchema,
          },
        },
      },
      getMeHandler,
    );
  },
  {
    name: 'me-routes',
    encapsulate: true,
  },
);
