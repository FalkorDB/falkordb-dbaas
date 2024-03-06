import fp from 'fastify-plugin';
import { cloudBuildOperationsCallbackHandler } from './handlers/cloudbuild';

export default fp(
  async function provision(fastify, opts) {
    fastify.post(
      '/cloudbuild/callback',
      {
        schema: {
          tags: ['operations'],
        },
      },
      cloudBuildOperationsCallbackHandler,
    );
  },
  {
    name: 'operations-routes',
    encapsulate: true,
  },
);
