import { configDotenv } from 'dotenv';
configDotenv();

import { init } from '@falkordb/configs';
init(process.env.SERVICE_NAME, process.env.NODE_ENV);

import { type FastifyInstance, type FastifyPluginOptions } from 'fastify';
import AutoLoad from '@fastify/autoload';
import Sensible from '@fastify/sensible';
import Env from '@fastify/env';
import Cors from '@fastify/cors';
import { join } from 'path';
import { EnvSchema } from './schemas/dotenv';
import MongoDB from '@fastify/mongodb';
import fastifyRequestContextPlugin from '@fastify/request-context';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { setupContainer, setupGlobalContainer } from './container';
import { swaggerPlugin, pubsubDecodePlugin, falkordbClientPlugin } from '@falkordb/plugins';
import openTelemetryPlugin from '@autotelic/fastify-opentelemetry';
import { captchaPlugin } from '@falkordb/plugins';
import { ICaptchaRepository } from './repositories/captcha/ICaptchaRepository';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
  await fastify.register(Env, {
    schema: EnvSchema,
    dotenv: true,
    data: opts.configData,
  });

  await fastify.register(Sensible);

  await fastify.register(Cors, {
    origin: true,
  });

  fastify.register(swaggerPlugin, {
    swagger: {
      info: {
        title: 'FalkorDB',
        description: 'API Endpoints for FalkorDB Auth',
        version: '0.1.0',
      },
      tags: [],
    },
  });

  fastify.register(pubsubDecodePlugin);

  await fastify.register(MongoDB, {
    forceClose: true,
    url: fastify.config.MONGODB_URI,
    database: fastify.config.MONGODB_DB,
  });

  fastify.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  fastify.register(fastifyRequestContextPlugin);

  await fastify.register(falkordbClientPlugin, {
    injectContext: true,
    client: {
      url: fastify.config.FALKORDB_SERVER_URL,
      urls: {
        v1: {
          organizations: fastify.config.FALKORDB_ORGANIZATIONS_URL,
          provisioner: fastify.config.FALKORDB_PROVISIONER_URL,
          users: fastify.config.FALKORDB_USERS_URL,
        },
      },
    },
  });

  await fastify.register(openTelemetryPlugin, { wrapRoutes: true });

  setupGlobalContainer(fastify);

  await fastify.register(captchaPlugin, {
    captchaRepository: fastify.diContainer.resolve<ICaptchaRepository>(ICaptchaRepository.repositoryName),
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    routeParams: true,
    indexPattern: /.*routes(\.js|\.cjs)$/i,
    ignorePattern: /spec\.ts$/,
    autoHooksPattern: /.*hooks(\.js|\.cjs|\.ts)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: Object.assign({}, opts),
  });

  fastify.addHook('onRequest', (request, _, done) => {
    setupContainer(request);

    const { activeSpan } = request.openTelemetry();
    activeSpan.setAttributes({
      organizationId: request.headers['x-falkordb-organizationid'],
      userId: request.headers['x-falkordb-userid'],
    });

    done();
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    // Add trace ID
    const { activeSpan } = request.openTelemetry();
    if (activeSpan.spanContext().traceId) {
      reply.header('x-trace-id', activeSpan.spanContext().traceId);
    }
    done();
  });

  if (fastify.config.NODE_ENV === 'development') {
    console.log('CURRENT ROUTES:');
    console.log(fastify.printRoutes());
  }
}
