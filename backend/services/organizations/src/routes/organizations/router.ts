import fp from 'fastify-plugin';
import { getOrganizationsHandler } from './handlers/get';
import { createOrganizationsHandler } from './handlers/create';
import {
  CreateOrganizationRequestBodySchema,
  CreateOrganizationRequestHeadersSchema,
  CreateOrganizationResponseSchema,
  ListOrganizationsRequestQuerySchema,
  ListOrganizationsResponseSchema,
} from '@falkordb/schemas/src/services/organizations/v1';

export default fp(
  async function provision(fastify, opts) {
    fastify.get(
      '',
      {
        schema: {
          tags: ['organizations'],
          querystring: ListOrganizationsRequestQuerySchema,
          response: {
            200: ListOrganizationsResponseSchema,
          },
        },
      },

      getOrganizationsHandler,
    );

    fastify.post(
      '',
      {
        schema: {
          tags: ['organizations'],
          headers: CreateOrganizationRequestHeadersSchema,
          body: CreateOrganizationRequestBodySchema,
          response: { 200: CreateOrganizationResponseSchema },
        },
      },

      createOrganizationsHandler,
    );
  },
  {
    name: 'organizations-routes',
    encapsulate: true,
  },
);
