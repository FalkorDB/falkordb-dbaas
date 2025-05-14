import fp from 'fastify-plugin';
import {
  TenantGroupProvisionBodySchema,
  type TenantGroupProvisionBodySchemaType,
  TenantGroupDeprovisionParamsSchema,
  TenantGroupRefreshParamsSchema,
} from '@falkordb/schemas/services/provisioner/v1';
import { tenantGroupProvisionHandler } from './handlers/provision';
import { tenantGroupDeprovisionHandler } from './handlers/deprovision';
import { tenantGroupRefreshHandler } from './handlers/refresh';

export default fp(
  async function tenantGroup(fastify, opts) {
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
