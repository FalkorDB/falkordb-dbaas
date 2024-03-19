import { DeleteMemberRequestParamsSchema } from '@falkordb/schemas/dist/services/organizations/v1';
import fp from 'fastify-plugin';
import { deleteMemberHandler } from './handlers/delete';

export default fp(
  async function members(fastify, opts) {
    fastify.delete(
      '/',
      {
        schema: {
          tags: ['members'],
          params: DeleteMemberRequestParamsSchema,
        },
      },
      deleteMemberHandler,
    );
  },
  {
    name: 'member-routes',
    encapsulate: true,
  },
);
