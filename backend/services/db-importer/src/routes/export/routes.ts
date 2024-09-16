import fp from 'fastify-plugin';
import { ExportRDBRequestBodySchema } from '../../schemas/export-rdb';

export default fp(
  async function signUp(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      await fastify.validateCaptcha(request);
    });

    fastify.post(
      '/',
      {
        schema: {
          tags: ['export'],
          body: ExportRDBRequestBodySchema,
        },
      },
      exportRDBHandler,
    );
  },
  {
    name: 'export-routes',
  },
);
