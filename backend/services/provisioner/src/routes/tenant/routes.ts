// import fp from 'fastify-plugin';
// import {
//   tenantProvisionBodySchema,
//   type tenantProvisionBodySchemaType,
// } from './schemas/provision';
// import { tenantProvisionHandler } from './handlers/provision';
// import { TenantDeprovisionParamsSchema } from './schemas/deprovision';
// import { tenantDeprovisionHandler } from './handlers/deprovision';

// export default fp(
//   async function provision(fastify, opts) {
//     fastify.post<{ Body: tenantProvisionBodySchemaType }>(
//       '/provision',
//       {
//         schema: {
//           body: tenantProvisionBodySchema,
//         },
//       },
//       tenantProvisionHandler,
//     );

//     fastify.post(
//       '/:id/deprovision',
//       {
//         schema: {
//           params: tenantDeprovisionParamsSchema,
//         },
//       },
//       tenantDeprovisionHandler,
//     );
//   },
//   {
//     name: 'tenant-provisioning-routes',
//     encapsulate: true,
//   },
// );
