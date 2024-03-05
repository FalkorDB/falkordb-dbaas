import fp from 'fastify-plugin';
import {
  TenantProvisionBodySchema,
  TenantProvisionHeadersSchema,
  type TenantProvisionBodySchemaType,
} from './schemas/provision';
import { tenantProvisionHandler } from './handlers/provision';
import { TenantRefreshParamsSchema, TenantRefreshParamsSchemaType } from './schemas/refresh';
import { tenantRefreshHandler } from './handlers/refresh';
import { TenantDeprovisionParamsSchema } from './schemas/deprovision';
import { tenantDeprovisionHandler } from './handlers/deprovision';

export default fp(
  async function provision(fastify, opts) {
    fastify.post<{ Body: TenantProvisionBodySchemaType }>(
      '/provision',
      {
        schema: {
          headers: TenantProvisionHeadersSchema,
          body: TenantProvisionBodySchema,
        },
      },
      tenantProvisionHandler,
    );

    fastify.post<{ Params: TenantRefreshParamsSchemaType }>(
      '/:id/refresh',
      {
        schema: {
          params: TenantRefreshParamsSchema,
        },
      },
      tenantRefreshHandler,
    );

    fastify.post<{ Params: TenantRefreshParamsSchemaType }>(
      '/:id/deprovision',
      {
        schema: {
          params: TenantDeprovisionParamsSchema,
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
