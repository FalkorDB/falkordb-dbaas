import fp from 'fastify-plugin';
import {
  GetMembershipsRequestParamsSchema,
  GetMembershipsRequestQuerySchema,
  GetMembershipsResponseBodySchema,
} from './schemas/memberships';
import { getUserMembershipsHandler } from './handlers/get';

export default fp(
  async function userMemberships(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['memberships'],
          params: GetMembershipsRequestParamsSchema,
          querystring: GetMembershipsRequestQuerySchema,
          response: {
            200: GetMembershipsResponseBodySchema,
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
