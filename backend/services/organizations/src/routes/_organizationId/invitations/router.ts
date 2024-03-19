import fp from 'fastify-plugin';
import { getInvitationsHandler } from './handlers/get';
import { createInvitationHandler } from './handlers/create';
import {
  CreateOrganizationInvitationRequestBodySchema,
  CreateOrganizationInvitationRequestHeadersSchema,
  CreateOrganizationInvitationRequestParamsSchema,
  CreateOrganizationInvitationResponseSchema,
  ListOrganizationInvitationsRequestParamsSchema,
  ListOrganizationInvitationsRequestQuerySchema,
  ListOrganizationInvitationsResponseSchema,
} from '@falkordb/schemas/dist/services/organizations/v1';

export default fp(
  async function invitations(fastify, opts) {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['organization-invitations'],
          params: ListOrganizationInvitationsRequestParamsSchema,
          querystring: ListOrganizationInvitationsRequestQuerySchema,
          response: {
            200: ListOrganizationInvitationsResponseSchema,
          },
        },
      },

      getInvitationsHandler,
    );

    fastify.post(
      '/',
      {
        schema: {
          tags: ['organization-invitations'],
          headers: CreateOrganizationInvitationRequestHeadersSchema,
          params: CreateOrganizationInvitationRequestParamsSchema,
          body: CreateOrganizationInvitationRequestBodySchema,
          response: { 200: CreateOrganizationInvitationResponseSchema },
        },
      },

      createInvitationHandler,
    );
  },
  {
    name: 'organization-invitations-routes',
    encapsulate: true,
  },
);
