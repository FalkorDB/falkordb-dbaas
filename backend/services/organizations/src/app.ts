import { configDotenv } from 'dotenv';
configDotenv();

import { init } from '@falkordb/configs/openTelemetryConfig';
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
import { setupContainer } from './container';
import { swaggerPlugin, pubsubDecodePlugin } from '@falkordb/plugins';
import openTelemetryPlugin from '@autotelic/fastify-opentelemetry';

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
        description: 'API Endpoints for FalkorDB Organizations',
        version: '0.1.0',
      },
      tags: [
        { name: 'organizations', description: 'Organizations' },
        { name: 'organization-members', description: 'Organization Members' },
        { name: 'organization-invitations', description: 'Organization Invitations' },
        { name: 'invitations', description: 'Invitations' },
        { name: 'members', description: 'Members' },
      ],
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

  await fastify.register(openTelemetryPlugin, { wrapRoutes: true });

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
