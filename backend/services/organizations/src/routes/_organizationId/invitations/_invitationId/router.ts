import fp from 'fastify-plugin';
import { deleteInvitationHandler } from './handlers/delete';
import { resendInvitationHandler } from './handlers/resend';
import {
  AcceptOrganizationInvitationRequestHeadersSchemaType,
  AcceptOrganizationInvitationRequestParamsSchema,
  DeleteOrganizationInvitationRequestParamsSchema,
  RejectOrganizationInvitationRequestHeadersSchemaType,
  RejectOrganizationInvitationRequestParamsSchema,
  ResendOrganizationInvitationRequestParamsSchema,
  ResendOrganizationInvitationResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';
import { acceptInvitationHandler } from './handlers/accept';
import { rejectInvitationHandler } from './handlers/reject';

export default fp(
  async function invitations(fastify, opts) {
    fastify.delete(
      '/',
      {
        schema: {
          tags: ['organization-invitations'],
          params: DeleteOrganizationInvitationRequestParamsSchema,
        },
      },

      deleteInvitationHandler,
    );

    fastify.post(
      '/resend',
      {
        schema: {
          tags: ['organization-invitations'],
          params: ResendOrganizationInvitationRequestParamsSchema,
          response: { 200: ResendOrganizationInvitationResponseSchema },
        },
      },

      resendInvitationHandler,
    );

    fastify.post(
      '/accept',
      {
        schema: {
          tags: ['organization-invitations'],
          headers: AcceptOrganizationInvitationRequestHeadersSchemaType,
          params: AcceptOrganizationInvitationRequestParamsSchema,
        },
      },

      acceptInvitationHandler,
    );

    fastify.post(
      '/reject',
      {
        schema: {
          tags: ['organization-invitations'],
          headers: RejectOrganizationInvitationRequestHeadersSchemaType,
          params: RejectOrganizationInvitationRequestParamsSchema,
        },
      },

      rejectInvitationHandler,
    );
  },
  {
    name: 'organization-invitation-routes',
    encapsulate: true,
  },
);
