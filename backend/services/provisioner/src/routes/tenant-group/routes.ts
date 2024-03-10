import fp from 'fastify-plugin';
import {
  TenantGroupProvisionBodySchema,
  type TenantGroupProvisionBodySchemaType,
} from './schemas/provision';
import { tenantGroupProvisionHandler } from './handlers/provision';
import { TenantGroupDeprovisionParamsSchema } from './schemas/deprovision';
import { tenantGroupDeprovisionHandler } from './handlers/deprovision';
import { TenantGroupRefreshParamsSchema } from './schemas/refresh';
import { tenantGroupRefreshHandler } from './handlers/refresh';

export default fp(
  async function provision(fastify, opts) {

    fastify.post<{ Body: TenantGroupProvisionBodySchemaType }>(
      '/provision',
      {
        schema: {
          tags: ['tenant-group'],
          body: TenantGroupProvisionBodySchema,
        },
      },
      tenantGroupProvisionHandler,
    );

    fastify.post(
      '/:id/refresh',
      {
        schema: {
          tags: ['tenant-group'],
          params: TenantGroupRefreshParamsSchema,
        },
      },
      tenantGroupRefreshHandler,
    );

    fastify.post(
      '/:id/deprovision',
      {
        schema: {
          tags: ['tenant-group'],
          params: TenantGroupDeprovisionParamsSchema,
        },
      },
      tenantGroupDeprovisionHandler,
    );
  },
  {
    name: 'tenant-group-provisioning-routes',
    encapsulate: true,
  },
);
