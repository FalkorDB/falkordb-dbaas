import fp from 'fastify-plugin';
import {
  CloudBuildOperationsCallbackBodySchema,
  CloudBuildOperationsCallbackBodySchemaType,
} from './schemas/cloudbuild';
import { cloudBuildOperationsCallbackHandler } from './handlers/cloudbuild';

export default fp(
  async function provision(fastify, opts) {
    fastify.post<{ Body: CloudBuildOperationsCallbackBodySchemaType }>(
      '/cloudbuild/callback',
      {
        schema: {
          body: CloudBuildOperationsCallbackBodySchema,
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
