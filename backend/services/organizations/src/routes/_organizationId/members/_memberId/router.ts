import fp from 'fastify-plugin';
import { updateMemberHandler } from './handlers/update';
import { deleteMemberHandler } from './handlers/delete';
import {
  DeleteOrganizationMemberRequestParamsSchema,
  UpdateOrganizationMemberRequestBodySchema,
  UpdateOrganizationMemberRequestParamsSchema,
  UpdateOrganizationMemberResponseSchema,
} from '@falkordb/schemas/services/organizations/v1';

export default fp(
  async function members(fastify, opts) {
    fastify.put(
      '/',
      {
        schema: {
          tags: ['organization-members'],
          params: UpdateOrganizationMemberRequestParamsSchema,
          body: UpdateOrganizationMemberRequestBodySchema,
          response: { 200: UpdateOrganizationMemberResponseSchema },
        },
      },

      updateMemberHandler,
    );

    fastify.delete(
      '/',
      {
        schema: {
          tags: ['organization-members'],
          params: DeleteOrganizationMemberRequestParamsSchema,
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
