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

  await fastify.register(AutoLoad, {
    dir: join(__dirname, '.', 'plugins'),
    dirNameRoutePrefix: false,
    ignorePattern: /.*.no-load\.js/,
    indexPattern: /^no$/i,
    options: Object.assign({}, opts),
  });

  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
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
  });

  fastify.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  fastify.register(fastifyRequestContextPlugin);

  fastify.addHook('onRequest', (request, _, done) => {
    setupContainer(request);
    done();
  });

  if (fastify.config.NODE_ENV === 'development') {
    console.log('CURRENT ROUTES:');
    console.log(fastify.printRoutes());
  }
}
