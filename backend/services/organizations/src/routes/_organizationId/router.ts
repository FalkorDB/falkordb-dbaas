import fp from 'fastify-plugin';
import {
  DeleteOrganizationRequestParamsSchema,
  GetOrganizationRequestParamsSchema,
  GetOrganizationResponseSchema,
  UpdateOrganizationRequestBodySchema,
  UpdateOrganizationRequestParamsSchema,
  UpdateOrganizationResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';
import { getOrganizationHandler } from './handlers/get';
import { updateOrganizationHandler } from './handlers/update';
import { deleteOrganizationHandler } from './handlers/delete';

export default fp(
  async function provision(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['organizations'],
          params: GetOrganizationRequestParamsSchema,
          response: {
            200: GetOrganizationResponseSchema,
          },
        },
      },

      getOrganizationHandler,
    );

    fastify.put(
      '',
      {
        schema: {
          tags: ['organizations'],
          params: UpdateOrganizationRequestParamsSchema,
          body: UpdateOrganizationRequestBodySchema,
          response: { 200: UpdateOrganizationResponseSchema },
        },
      },

      updateOrganizationHandler,
    );

    fastify.delete(
      '',
      {
        schema: {
          tags: ['organizations'],
          params: DeleteOrganizationRequestParamsSchema,
        },
      },

      deleteOrganizationHandler,
    );
  },
  {
    name: 'organization-routes',
    encapsulate: true,
  },
);
