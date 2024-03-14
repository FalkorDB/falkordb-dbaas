import fp from 'fastify-plugin';
import { deleteInvitationHandler } from './handlers/delete';
import { resendInvitationHandler } from './handlers/resend';
import {
  DeleteOrganizationInvitationRequestParamsSchema,
  ResendOrganizationInvitationRequestParamsSchema,
  ResendOrganizationInvitationResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';

export default fp(
  async function provision(fastify, opts) {
    fastify.delete(
      '',
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
  },
  {
    name: 'organization-invitation-routes',
    encapsulate: true,
  },
);
