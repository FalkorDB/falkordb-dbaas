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
    redact: {
      paths: ['username', 'password', 'bearerToken', 'token', '*.username', '*.password', 'req.body.password', 'req.headers.authorization'],
      censor: '***',
    },
  },
  production: {
    level: 'info',
    redact: {
      paths: ['username', 'password', 'bearerToken', 'token', '*.username', '*.password', 'req.body.password', 'req.headers.authorization'],
      censor: '***',
    },
  },
  test: false,
};

export async function start() {
  const fastify = Fastify({
    logger: envToLogger[process.env.NODE_ENV || 'development'],
    trustProxy: true,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 30000,
  });

  await fastify.register(App);

  
  const port = fastify.config?.PORT || parseInt(process.env.PORT, 10) || 3013;
  const host = '0.0.0.0';

  await fastify.listen({
    host,
    port,
  });

  // Graceful shutdown
  const closeGracefully = async (signal: string) => {
    fastify.log.info(`Received ${signal}, closing server gracefully`);
    await fastify.close();
    fastify.log.info('Server closed');
    process.exit(0);
  };

  process.on('SIGTERM', () => closeGracefully('SIGTERM'));
  process.on('SIGINT', () => closeGracefully('SIGINT'));

  return fastify;
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
