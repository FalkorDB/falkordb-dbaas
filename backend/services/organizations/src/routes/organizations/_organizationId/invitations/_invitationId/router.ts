import fp from 'fastify-plugin';
import { DeleteInvitationRequestParamsSchema, ResendInvitationRequestParamsSchema, ResendInvitationResponseSchema } from './schemas/invitation';
import { deleteInvitationHandler } from './handlers/delete';
import { resendInvitationHandler } from './handlers/resend';

export default fp(
  async function provision(fastify, opts) {
    fastify.delete(
      '',
      {
        schema: {
          tags: ['invitations'],
          params: DeleteInvitationRequestParamsSchema,
        },
      },

      deleteInvitationHandler,
    );

    fastify.post(
      '/resend',
      {
        schema: {
          tags: ['invitations'],
          params: ResendInvitationRequestParamsSchema,
          response: { 200: ResendInvitationResponseSchema },
        },
      },

      resendInvitationHandler,
    );
  },
  {
    name: 'invitation-routes',
    encapsulate: true,
  },
);
