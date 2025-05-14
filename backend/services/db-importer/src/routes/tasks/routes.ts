import fp from 'fastify-plugin';
import { ListExportRDBTasksRequestQuerySchema, ListExportRDBTasksResponseSchema } from '@falkordb/schemas/services/import-export-rdb/v1';
import { listTasksHandler } from './handlers/listTasksHandler';

export default fp(
  async function handler(fastify, opts) {
    fastify.addHook('preHandler', async (request) => {
      if (request.routerPath.startsWith('/tasks')) {
        await fastify.authenticateOmnistrate(request);
      }
    });

    fastify.get(
      '/tasks',
      {
        schema: {
          tags: ['tasks'],
          querystring: ListExportRDBTasksRequestQuerySchema,
          response: { 200: ListExportRDBTasksResponseSchema },
          security: [
            {
              "bearerAuth": []
            }
          ]
        },
      },
      listTasksHandler,
    );
  },
  {
    name: 'tasks-routes',
  },
);
