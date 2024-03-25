import fp from 'fastify-plugin';
import { tenantProvisionHandler } from './handlers/provision';
import { tenantRefreshHandler } from './handlers/refresh';
import {
  TenantProvisionBodySchema,
  TenantProvisionHeadersSchema,
  type TenantProvisionBodySchemaType,
  TenantProvisionResponseSchema,
  TenantDeprovisionParamsSchema,
  TenantDeprovisionResponseSchema,
  TenantRefreshParamsSchema,
  TenantRefreshParamsSchemaType,
  TenantRefreshResponseSchema,
} from '@falkordb/schemas/src/services/provisioner/v1/tenant';
import { tenantDeprovisionHandler } from './handlers/deprovision';

export default fp(
  async function tenant(fastify, opts) {
    fastify.post<{ Body: TenantProvisionBodySchemaType }>(
      '/provision',
      {
        schema: {
          tags: ['tenant'],
          headers: TenantProvisionHeadersSchema,
          body: TenantProvisionBodySchema,
          response: {
            200: TenantProvisionResponseSchema,
          },
        },
      },
      tenantProvisionHandler,
    );

    fastify.post<{ Params: TenantRefreshParamsSchemaType }>(
      '/:id/refresh',
      {
        schema: {
          tags: ['tenant'],
          params: TenantRefreshParamsSchema,
          response: {
            200: TenantRefreshResponseSchema,
          },
        },
      },
      tenantRefreshHandler,
    );

    fastify.post<{ Params: TenantRefreshParamsSchemaType }>(
      '/:id/deprovision',
      {
        schema: {
          tags: ['tenant'],
          params: TenantDeprovisionParamsSchema,
          response: {
            200: TenantDeprovisionResponseSchema,
          },
        },
      },
      tenantDeprovisionHandler,
    );
  },
  {
    name: 'tenant-provisioning-routes',
    encapsulate: true,
  },
);
