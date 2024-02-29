import Fastify from 'fastify';
import App from './app';

export async function start() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(App);

  const PORT = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3000;
  await fastify.listen({
    port: PORT,
  });

  return fastify;
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
