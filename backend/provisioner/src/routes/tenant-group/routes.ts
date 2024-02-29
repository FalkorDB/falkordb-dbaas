import fp from 'fastify-plugin';
import {
  TenantGroupProvisionBodySchema,
  TenantGroupProvisionResponseSchema,
  type TenantGroupProvisionBodySchemaType,
} from './schemas/provision';
import { tenantGroupProvisionHandler } from './handlers/provision';

export default fp(
  async function provision(fastify, opts) {
    fastify.post<{ Body: TenantGroupProvisionBodySchemaType }>(
      '/provision',
      {
        schema: {
          body: TenantGroupProvisionBodySchema,
          response: {
            // 200: TenantGroupProvisionResponseSuccessSchema,
          },
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
