import fp from 'fastify-plugin';
import { ExportRDBRequestBodySchema, ExportRDBResponseBodySchema } from '@falkordb/schemas/src/services/import-export-rdb/v1/export/post';
import { exportRDBHandler } from './handlers/exportRDBHandler';

export default fp(
  async function signUp(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      if (request.routerPath.startsWith('/export')) {
        await fastify.validateCaptcha(request);
        await fastify.authenticateOmnistrate(request);
      }
    });


    fastify.post(
      '/export',
      {
        schema: {
          tags: ['export'],
          body: ExportRDBRequestBodySchema,
          response: { 202: ExportRDBResponseBodySchema },
          security: [
            {
              "bearerAuth": []
            }
          ]
        },
      },
      exportRDBHandler,
    );
  },
  {
    name: 'export-routes',
  },
);
