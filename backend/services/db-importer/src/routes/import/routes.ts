import fp from 'fastify-plugin';
import { ImportRDBRequestBodySchema } from '../../schemas/import-rdb';

export default fp(
  async function signUp(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      await fastify.validateCaptcha(request);
    });

    fastify.post(
      '/',
      {
        schema: {
          tags: ['import'],
          body: ImportRDBRequestBodySchema,
        },
      },
      importRDBHandler,
    );
  },
  {
    name: 'import-routes',
  },
);
