import fp from 'fastify-plugin';
import { getMembersHandler } from './handlers/get';
import {
  ListOrganizationMembersRequestParamsSchema,
  ListOrganizationMembersRequestQuerySchema,
  ListOrganizationMembersResponseSchema,
} from '@falkordb/schemas/dist/services/organizations/v1';

export default fp(
  async function members(fastify, opts) {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['organization-members'],
          params: ListOrganizationMembersRequestParamsSchema,
          querystring: ListOrganizationMembersRequestQuerySchema,
          response: {
            200: ListOrganizationMembersResponseSchema,
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
