import fp from 'fastify-plugin';
import { TenantProvisionBodySchema, TenantProvisionHeadersSchema, type TenantProvisionBodySchemaType } from './schemas/provision';
import { tenantProvisionHandler } from './handlers/provision';

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

    // fastify.post(
    //   '/:id/refresh',
    //   {
    //     schema: {
    //       params: TenantRefreshParamsSchema,
    //     },
    //   },
    //   tenantRefreshHandler,
    // );

    // fastify.post(
    //   '/:id/deprovision',
    //   {
    //     schema: {
    //       params: TenantDeprovisionParamsSchema,
    //     },
    //   },
    //   tenantDeprovisionHandler,
    // );
  },
  {
    name: 'tenant-provisioning-routes',
    encapsulate: true,
  },
);
