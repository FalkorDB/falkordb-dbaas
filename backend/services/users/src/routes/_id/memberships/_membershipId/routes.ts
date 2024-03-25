import fp from 'fastify-plugin';
import { DeleteUserMembershipRequestParamsSchema } from '@falkordb/schemas/dist/services/users/v1';
import { deleteMembershipHandler } from './handlers/delete';

export default fp(
  async function userId(fastify, opts) {
    fastify.delete(
      '/',
      {
        schema: {
          tags: ['memberships'],
          params: DeleteUserMembershipRequestParamsSchema,
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
