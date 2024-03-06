import fp from 'fastify-plugin';

export default fp(
  async function userId(fastify, opts) {
    fastify.get('/', async function (request, reply) {
      reply.send({
        route: 'userId',
      });
    });
  },
  {
    name: 'userId-routes',
    encapsulate: true,
  },
);
