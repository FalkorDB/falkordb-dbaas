import {
  ListMembersRequestQuerySchema,
  ListMembersResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';
import fp from 'fastify-plugin';
import { listMembersHandler } from './handlers/list';

export default fp(
  async function members(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['members'],
          querystring: ListMembersRequestQuerySchema,
          response: {
            200: ListMembersResponseSchema,
          },
        },
      },
      listMembersHandler,
    );
  },
  {
    name: 'members-routes',
    encapsulate: true,
  },
);
