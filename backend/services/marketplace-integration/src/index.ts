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
  test: {
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
};

export async function start() {
  const fastify = Fastify({
    logger: envToLogger[process.env.NODE_ENV || 'development'],
    trustProxy: true,
  });

  await fastify.register(App);


  const port = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3000;
  const host = '0.0.0.0';

  await fastify.listen({
    host,
    port,
  }).then(() => { 
    fastify.log.info(`Server listening on ${host}:${port}`);
    globalThis.__SERVER__ = fastify;
  }).catch((error) => {
    fastify.log.error(`Error starting server: ${error}`);
    process.exit(1);
  })

  return fastify;
}

if (process.env.NODE_ENV !== 'test') {
  start()
}
