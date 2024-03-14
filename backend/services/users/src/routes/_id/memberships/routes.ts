import fp from 'fastify-plugin';
import {
  GetUserMembershipsRequestParamsSchema,
  GetUserMembershipsRequestQuerySchema,
  GetUserMembershipsResponseBodySchema,
} from '@falkordb/schemas/src/services/users/v1';
import { getUserMembershipsHandler } from './handlers/get';

export default fp(
  async function userMemberships(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['memberships'],
          params: GetUserMembershipsRequestParamsSchema,
          querystring: GetUserMembershipsRequestQuerySchema,
          response: {
            200: GetUserMembershipsResponseBodySchema,
          },
        },
      },
      getUserMembershipsHandler,
    );
  },
  {
    name: 'user-organizations-routes',
    encapsulate: true,
  },
);
