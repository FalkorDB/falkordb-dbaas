import { configDotenv } from 'dotenv';
configDotenv();

import { init } from '@falkordb/configs';
init(process.env.SERVICE_NAME ?? 'customer-ldap', process.env.NODE_ENV ?? 'production');

import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import { timingSafeEqual } from 'crypto';
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

const QUEUE_DASH_BASE_URL = '/v1/customer-ldap/queues';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(Env, {
    schema: EnvSchema,
    dotenv: true,
    data: opts.configData,
  });

  await fastify.register(Sensible);

  // Parse CORS origins from comma-separated string.
  // A wildcard '*' cannot be used with credentials; in that case reflect the
  // request Origin back so browsers can send cookies (Access-Control-Allow-Credentials: true).
  const corsOrigins =
    fastify.config.CORS_ORIGINS === '*'
      ? async (origin: string | undefined) => origin ?? '*' // reflect any origin — allows credentials
      : fastify.config.CORS_ORIGINS
        ? fastify.config.CORS_ORIGINS.split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : false;

  await fastify.register(Cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

  // Register QueueDash UI for queue monitoring and management
  // Requires QUEUE_DASHBOARD_TOKEN env var when running outside dev/test
  const queueDashToken = fastify.config.QUEUE_DASHBOARD_TOKEN;
  const isDevOrTest = fastify.config.NODE_ENV === 'development' || fastify.config.NODE_ENV === 'test';

  if (!queueDashToken && !isDevOrTest) {
    fastify.log.warn(
      'QUEUE_DASHBOARD_TOKEN is not set - QueueDash UI is disabled in production. Set QUEUE_DASHBOARD_TOKEN to enable it.',
    );
  } else {
    try {
      const ctx: QueueDashContext = {
        queues: queueManager.getQueues().map((queue) => ({
          type: 'bullmq',
          queue,
          displayName: queue.name,
        })),
      };

      // Register QueueDash in a scope (no Fastify prefix — baseUrl handles mounting at /queues).
      // Auth: first request must supply ?token=; a signed session cookie is then set so the
      // SPA's internal tRPC calls pass without re-supplying the token on every request.
      await fastify.register(async (instance) => {
        if (queueDashToken) {
          instance.addHook('onRequest', async (request, reply) => {
            // Accept a valid ?token= query param (sets session cookie) OR a live session cookie.
            const tokenParamRaw = (request.query as Record<string, unknown> | undefined)?.token;
            const tokenParam = Array.isArray(tokenParamRaw) ? tokenParamRaw[0] : tokenParamRaw;

            const validParam =
              typeof tokenParam === 'string' &&
              tokenParam.length === queueDashToken.length &&
              timingSafeEqual(Buffer.from(tokenParam) as Uint8Array, Buffer.from(queueDashToken) as Uint8Array);

            if (validParam) {
              // Issue a signed session cookie so subsequent SPA API calls pass through.
              reply.setCookie('queuedash_session', 'authenticated', {
                httpOnly: true,
                signed: true,
                path: QUEUE_DASH_BASE_URL,
                sameSite: 'strict',
                secure: !isDevOrTest,
              });
              return;
            }

            const cookieResult = request.unsignCookie(request.cookies?.queuedash_session ?? '');
            if (!cookieResult.valid || cookieResult.value !== 'authenticated') {
              return reply.code(401).send({ error: 'Unauthorized' });
            }
          });
        }

        await instance.register(fastifyQueueDashPlugin, { ctx, baseUrl: QUEUE_DASH_BASE_URL });
      });
      fastify.log.info(
        { path: QUEUE_DASH_BASE_URL },
        'QueueDash UI available (access with ?token=QUEUE_DASHBOARD_TOKEN)',
      );
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
