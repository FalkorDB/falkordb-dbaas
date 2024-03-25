import {
  ListInvitationsRequestQuerySchema,
  ListInvitationsResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';
import fp from 'fastify-plugin';
import { listInvitationsHandler } from './handlers/list';

export default fp(
  async function invitations(fastify, opts) {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['invitations'],
          querystring: ListInvitationsRequestQuerySchema,
          response: {
            200: ListInvitationsResponseSchema,
          },
        },
      },
      listInvitationsHandler,
    );
  },
  {
    name: 'invitations-routes',
    encapsulate: true,
  },
);
