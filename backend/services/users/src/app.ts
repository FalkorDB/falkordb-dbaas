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
import falkordbClientPlugin from '@falkordb/rest-client/src/fastify-plugin';

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
        description: 'API Endpoints for FalkorDB Users',
        version: '0.1.0',
      },
      tags: [
        {
          name: 'me',
          description: 'Me operations',
        },
        {
          name: 'users',
          description: 'User operations',
        },
        {
          name: 'invitations',
          description: 'User invitations operations',
        },
        {
          name: 'memberships',
          description: 'User memberships operations',
        },
      ],
    },
  });
  fastify.register(pubsubDecodePlugin);

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

  fastify.addHook('onRequest', (request, _, done) => {
    setupContainer(request);
    done();
  });

  if (fastify.config.NODE_ENV === 'development') {
    console.log('CURRENT ROUTES:');
    console.log(fastify.printRoutes());
  }
}
