import fp from 'fastify-plugin';
import { TenantGroupProvisionBodySchema, type TenantGroupProvisionBodySchemaType } from './schemas/provision';
import { tenantGroupProvisionHandler } from './handlers/provision';

export default fp(
  async function provision(fastify, opts) {
    fastify.post<{ Body: TenantGroupProvisionBodySchemaType }>(
      '/provision',
      {
        schema: {
          body: TenantGroupProvisionBodySchema,
        },
      },
      tenantGroupProvisionHandler,
    );
  },
  {
    name: 'tenant-group-provisioning-routes',
    encapsulate: true,
  },
);
