import { DeleteUserRequestParamsSchema } from '@falkordb/schemas/services/auth/v1';
import fp from 'fastify-plugin';
import { deleteUserHandler } from './handlers/delete';

export default fp(
  async function signUp(fastify, opts) {
    fastify.delete(
      '/:userId',
      {
        schema: {
          tags: ['delete'],
          params: DeleteUserRequestParamsSchema,
        },
      },
      deleteUserHandler,
    );
  },
  {
    name: 'delete-user-routes',
  },
);
