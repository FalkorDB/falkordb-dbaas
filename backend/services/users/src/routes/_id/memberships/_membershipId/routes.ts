import fp from 'fastify-plugin';
import { DeleteMembershipRequestParamsSchema } from './schemas/memberships';
import { deleteMembershipHandler } from './handlers/delete';

export default fp(
  async function userId(fastify, opts) {
    fastify.delete(
      '',
      {
        schema: {
          tags: ['memberships'],
          params: DeleteMembershipRequestParamsSchema,
        },
      },
      deleteMembershipHandler,
    );
  },
  {
    name: 'membership-routes',
    encapsulate: true,
  },
);
