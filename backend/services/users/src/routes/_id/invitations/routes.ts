import fp from 'fastify-plugin';
import {
  GetInvitationsRequestParamsSchema,
  GetInvitationsRequestQuerySchema,
  GetInvitationsResponseBodySchema,
} from '@falkordb/schemas/src/services/users/v1';
import { getInvitationsHandler } from './handlers/get';

export default fp(
  async function userId(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['invitations'],
          params: GetInvitationsRequestParamsSchema,
          querystring: GetInvitationsRequestQuerySchema,
          response: {
            200: GetInvitationsResponseBodySchema,
          },
        },
      },
      getInvitationsHandler,
    );
  },
  {
    name: 'user-invitations-routes',
    encapsulate: true,
  },
);
