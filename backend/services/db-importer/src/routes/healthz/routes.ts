import fp from 'fastify-plugin';


export default fp(
  async function handler(fastify, opts) {
    fastify.get(
      '/healthz',
      {
        schema: {
          tags: ['healthz'],
        },
      },
      async (request, reply) => {
        reply.status(200).send({
          status: 'ok',
        });
      }
    );
  },
  {
    name: 'healthz-routes',
  }
);