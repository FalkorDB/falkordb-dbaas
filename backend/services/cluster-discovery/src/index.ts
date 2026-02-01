import Fastify from 'fastify';
import App from './app';

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
  production: {
    level: 'info',
  },
  test: false,
};

type Environment = 'development' | 'production' | 'test';

function getLoggerConfig(env: string = 'production') {
  const validEnv = (env in envToLogger ? env : 'production') as Environment;
  return envToLogger[validEnv];
}

export async function start() {
  const fastify = Fastify({
    logger: getLoggerConfig(process.env.NODE_ENV || 'production'),
    trustProxy: true,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
  });

  await fastify.register(App);

  const port = parseInt(process.env.PORT || '3000', 10);

  await fastify.listen({
    host: '0.0.0.0',
    port,
  });

  fastify.log.info(
    {
      port,
      nodeEnv: process.env.NODE_ENV || 'production',
      scanInterval: fastify.config?.SCAN_INTERVAL_MS ?? process.env.SCAN_INTERVAL_MS,
    },
    `${fastify.config?.SERVICE_NAME ?? process.env.SERVICE_NAME ?? 'cluster-discovery'} started`,
  );

  // Graceful shutdown
  let isShuttingDown = false;
  const closeGracefully = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
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

