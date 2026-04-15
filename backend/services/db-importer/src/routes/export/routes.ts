import fp from 'fastify-plugin';
import {
  ExportRDBRequestBodySchema,
  ExportRDBResponseBodySchema,
} from '@falkordb/schemas/services/import-export-rdb/v1';
import { exportRDBHandler } from './handlers/exportRDBHandler';

export default fp(
  async function handler(fastify, opts) {

    fastify.post(
      '/export',
      {
        preHandler: async (request) => {
          await fastify.authenticateOmnistrate(request);
        },
        schema: {
          tags: ['export'],
          body: ExportRDBRequestBodySchema,
          response: { 202: ExportRDBResponseBodySchema },
          security: [
            {
              bearerAuth: [],
            },
          ],
        },
      },
      exportRDBHandler,
    );
  },
  {
    name: 'export-routes',
  },
);
