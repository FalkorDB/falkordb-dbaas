import Fastify from 'fastify';
import App from './app';

export async function start() {
  const fastify = Fastify({
    logger: true,
    trustProxy: true,
  });

  await fastify.register(App);

  const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;
  const port = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3000;
  const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : undefined;

  await fastify.listen({
    host,
    port,
  });

  return fastify;
}

start()
  .then((fastify) => {
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  })
  .catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
  });
