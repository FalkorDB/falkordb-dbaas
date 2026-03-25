import fp from 'fastify-plugin';
import {
  ListRDBTasksRequestQuerySchema,
  ListRDBTasksResponseSchema,
} from '@falkordb/schemas/services/import-export-rdb/v1';
import { listTasksHandler } from './handlers/listTasksHandler';

export default fp(
  async function handler(fastify, opts) {
    fastify.get(
      '/tasks',
      {
        preHandler: async (request) => {
          await fastify.authenticateOmnistrate(request);
        },
        schema: {
          tags: ['tasks'],
          querystring: ListRDBTasksRequestQuerySchema,
          response: { 200: ListRDBTasksResponseSchema },
          security: [
            {
              bearerAuth: [],
            },
          ],
        },
      },
      listTasksHandler,
    );
  },
  {
    name: 'tasks-routes',
  },
);
