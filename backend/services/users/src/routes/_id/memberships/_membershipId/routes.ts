import fp from 'fastify-plugin';
import { DeleteMembershipRequestParamsSchema } from '@falkordb/schemas/src/services/users/v1';
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
