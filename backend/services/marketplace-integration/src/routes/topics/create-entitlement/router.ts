import fp from 'fastify-plugin';
import { createEntitlementHandler } from './handlers/createEntitlementHandler';
import { PubSubMessageSchema } from '../../../schemas/pubsub';

export default fp(
  async function createAccount(fastify, opts) {
    fastify.post(
      '/',
      {
        schema: {
          tags: ['topics'],
          body: PubSubMessageSchema,
        },
      },
      createEntitlementHandler,
    );
  },
  {
    name: 'create-entitlement-routes',
    encapsulate: true,
  },
);
