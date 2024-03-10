import fp from 'fastify-plugin';
import { getMembersHandler } from './handlers/get';
import {
  ListMembersRequestParamsSchema,
  ListMembersRequestQuerySchema,
  ListMembersResponseSchema,
} from './schemas/members';

export default fp(
  async function provision(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['members'],
          params: ListMembersRequestParamsSchema,
          querystring: ListMembersRequestQuerySchema,
          response: {
            200: ListMembersResponseSchema,
          },
        },
      },

      getMembersHandler,
    );
  },
  {
    name: 'organization-members-routes',
    encapsulate: true,
  },
);
