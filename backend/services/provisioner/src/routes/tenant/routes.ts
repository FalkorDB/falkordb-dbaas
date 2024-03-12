import fp from 'fastify-plugin';
import {
  TenantProvisionBodySchema,
  TenantProvisionHeadersSchema,
  type TenantProvisionBodySchemaType,
  TenantProvisionResponseSchema,
} from './schemas/provision';
import { tenantProvisionHandler } from './handlers/provision';
import {
  TenantRefreshParamsSchema,
  TenantRefreshParamsSchemaType,
  TenantRefreshResponseSchema,
} from './schemas/refresh';
import { tenantRefreshHandler } from './handlers/refresh';
import { TenantDeprovisionParamsSchema, TenantDeprovisionResponseSchema } from './schemas/deprovision';
import { tenantDeprovisionHandler } from './handlers/deprovision';

export default fp(
  async function provision(fastify, opts) {
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
