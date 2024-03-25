import App from './app';
import Fastify from 'fastify';

const envToLogger = {
  development: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: true,
  test: false,
};

export async function start() {
  const fastify = Fastify({
    logger: envToLogger[process.env.NODE_ENV || 'development'],
    trustProxy: true,
  });

  await fastify.register(App);

  const IS_GOOGLE_CLOUD_RUN = process.env.K_SERVICE !== undefined;
  const port = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3000;
  const host = IS_GOOGLE_CLOUD_RUN ? '0.0.0.0' : '127.0.0.1';

  await fastify.listen({
    host,
    port,
  });

  return fastify;
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
