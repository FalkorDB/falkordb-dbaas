import fp from 'fastify-plugin';
import {
  GetUserInvitationsRequestParamsSchema,
  GetUserInvitationsRequestQuerySchema,
  GetUserInvitationsResponseBodySchema,
} from '@falkordb/schemas/services/users/v1';
import { getInvitationsHandler } from './handlers/get';
import { context as c } from '@opentelemetry/api';

export default fp(
  async function userId(fastify, opts) {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['invitations'],
          params: GetUserInvitationsRequestParamsSchema,
          querystring: GetUserInvitationsRequestQuerySchema,
          response: {
            200: GetUserInvitationsResponseBodySchema,
          },
        },
      },
      getInvitationsHandler,
    )
  },
  {
    name: 'user-invitations-routes',
    encapsulate: true,
  },
);
