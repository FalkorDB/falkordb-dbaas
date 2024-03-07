import fp from 'fastify-plugin';
import { RejectInvitationRequestParamsSchema } from './schemas/invitation';
import { rejectInvitationHandler } from './handlers/post';

export default fp(
  async function userId(fastify, opts) {
    fastify.post(
      '',
      {
        schema: {
          tags: ['invitations'],
          params: RejectInvitationRequestParamsSchema,
        },
      },
      rejectInvitationHandler,
    );
  },
  {
    name: 'reject-invitation-routes',
    encapsulate: true,
  },
);
