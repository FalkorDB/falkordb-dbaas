import fp from 'fastify-plugin';
import { AcceptInvitationRequestParamsSchema } from './schemas/invitation';
import { acceptInvitationHandler } from './handlers/post';

export default fp(
  async function userId(fastify, opts) {
    fastify.post(
      '',
      {
        schema: {
          tags: ['invitations'],
          params: AcceptInvitationRequestParamsSchema,
        },
      },
      acceptInvitationHandler,
    );
  },
  {
    name: 'accept-invitation-routes',
    encapsulate: true,
  },
);
