import { configDotenv } from 'dotenv';
configDotenv();

import { init } from '@falkordb/configs';
init(process.env.SERVICE_NAME, process.env.NODE_ENV);

import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import AutoLoad from '@fastify/autoload';
import Sensible from '@fastify/sensible';
import Env from '@fastify/env';
import Cors from '@fastify/cors';
import Cookie from '@fastify/cookie';
import { join } from 'path';
import { EnvSchema } from './schemas/dotenv';
import fastifyRequestContextPlugin from '@fastify/request-context';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { setupContainer, setupGlobalContainer } from './container';
import { swaggerPlugin, omnistratePlugin } from '@falkordb/plugins';
import openTelemetryPlugin from '@autotelic/fastify-opentelemetry';
import { IOmnistrateRepository } from './repositories/omnistrate/IOmnistrateRepository';
import { QueueManager } from './queues/QueueManager';
import type { Context as QueueDashContext } from '@queuedash/api';
import { fastifyQueueDashPlugin } from '@queuedash/api';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(Env, {
    schema: EnvSchema,
    dotenv: true,
    data: opts.configData,
  });

  await fastify.register(Sensible);

  // Parse CORS origins from comma-separated string
  const corsOrigins =
    fastify.config.CORS_ORIGINS === '*'
      ? true
      : fastify.config.CORS_ORIGINS
        ? fastify.config.CORS_ORIGINS.split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : false;

  await fastify.register(Cors, {
    origin: corsOrigins,
  });

  await fastify.register(Cookie, {
    secret: fastify.config.JWT_SECRET,
  });

  fastify.register(swaggerPlugin, {
    swagger: {
      info: {
        title: 'FalkorDB',
        description: 'API Endpoints for FalkorDB DB Customer LDAP',
        version: '0.1.0',
      },
      tags: [],
    },
  });

  fastify.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  fastify.register(fastifyRequestContextPlugin);

  await fastify.register(openTelemetryPlugin, { wrapRoutes: true });

  setupGlobalContainer(fastify);

  await fastify.register(omnistratePlugin, {
    omnistrateRepository: fastify.diContainer.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName),
  });

  // Initialize queue manager
  const queueManager = new QueueManager(fastify);
  await queueManager.startWorkers();
  fastify.queueManager = queueManager;

  // Register QueueDash UI for queue monitoring
  if (fastify.config.NODE_ENV === 'development' || fastify.config.NODE_ENV === 'test') {
    try {
      const ctx: QueueDashContext = {
        queues: queueManager.getQueues().map((queue) => ({
          type: 'bullmq',
          queue,
          displayName: queue.name,
        })),
      };

      await fastify.register(
        (fastify, opts, done) => {
          fastifyQueueDashPlugin(fastify, { ctx, baseUrl: '/queues' }, done);
        },
        { prefix: '/queues' },
      );
      fastify.log.info('QueueDash UI available at /queues');
    } catch (error) {
      fastify.log.warn({ error }, 'Failed to register QueueDash UI');
    }
  }

  // 
  // Gracefully close queue manager on shutdown
  fastify.addHook('onClose', async () => {
    await queueManager.close();
  });

  fastify.addHook('onRequest', (request, _, done) => {
    setupContainer(request);

    done();
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    // Add trace ID
    const { activeSpan } = request.openTelemetry();
    const traceId = activeSpan?.spanContext()?.traceId;
    if (traceId) {
      reply.header('x-trace-id', traceId);
    }
    done();
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    indexPattern: /.*(routes|router)(\.ts|\.js|\.cjs)$/i,
    ignorePattern: /spec\.ts$/,
    autoHooksPattern: /.*hooks(\.js|\.cjs|\.ts)$/i,
    autoHooks: true,
    cascadeHooks: true,
    dirNameRoutePrefix: true,
    options: Object.assign({}, opts),
  });

  if (fastify.config.NODE_ENV === 'development') {
    console.log('CURRENT ROUTES:');
    console.log(fastify.printRoutes());
  }
}
