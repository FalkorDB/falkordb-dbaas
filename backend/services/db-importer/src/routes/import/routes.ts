// import fp from 'fastify-plugin';
// import { ImportRDBRequestBodySchema } from '../../schemas/import-rdb';

// export default fp(
//   async function handler(fastify, opts) {
    // fastify.addHook('preHandler', async (request) => {
    //   await fastify.validateCaptcha(request);
    //   await fastify.omnistrateAuthenticate(request);
    //   await fastify.extractUser();
    // });
    

//     fastify.post(
//       '/import',
//       {
//         schema: {
//           tags: ['import'],
//           body: ImportRDBRequestBodySchema,
//         },
//       },
//       importRDBHandler,
//     );
//   },
//   {
//     name: 'import-routes',
//   },
// );
