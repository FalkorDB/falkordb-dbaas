import fp from 'fastify-plugin';
import { updateMemberHandler } from './handlers/update';
import { deleteMemberHandler } from './handlers/delete';
import {
  DeleteMemberRequestParamsSchema,
  UpdateMemberRequestBodySchema,
  UpdateMemberRequestParamsSchema,
  UpdateMemberResponseSchema,
} from './schemas/member';

export default fp(
  async function provision(fastify, opts) {
    fastify.put(
      '',
      {
        schema: {
          tags: ['members'],
          params: UpdateMemberRequestParamsSchema,
          body: UpdateMemberRequestBodySchema,
          response: { 200: UpdateMemberResponseSchema },
        },
      },

      updateMemberHandler,
    );

    fastify.delete(
      '',
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
    name: 'organization-member-routes',
    encapsulate: true,
  },
);
