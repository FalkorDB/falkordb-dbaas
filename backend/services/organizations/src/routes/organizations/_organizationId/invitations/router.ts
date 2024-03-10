import fp from 'fastify-plugin';
import {
  CreateInvitationRequestBodySchema,
  CreateInvitationRequestHeadersSchema,
  CreateInvitationRequestParamsSchema,
  CreateInvitationResponseSchema,
  ListInvitationsRequestParamsSchema,
  ListInvitationsRequestQuerySchema,
  ListInvitationsResponseSchema,
} from './schemas/invitations';
import { getInvitationsHandler } from './handlers/get';
import { createInvitationHandler } from './handlers/create';

export default fp(
  async function provision(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['invitations'],
          params: ListInvitationsRequestParamsSchema,
          querystring: ListInvitationsRequestQuerySchema,
          response: {
            200: ListInvitationsResponseSchema,
          },
        },
      },

      getInvitationsHandler,
    );

    fastify.post(
      '',
      {
        schema: {
          tags: ['invitations'],
          headers: CreateInvitationRequestHeadersSchema,
          params: CreateInvitationRequestParamsSchema,
          body: CreateInvitationRequestBodySchema,
          response: { 200: CreateInvitationResponseSchema },
        },
      },

      createInvitationHandler,
    );
  },
  {
    name: 'invitations-routes',
    encapsulate: true,
  },
);
