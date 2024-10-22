import fp from 'fastify-plugin';
import { deleteEntitlementHandler } from './handlers/deleteEntitlementHandler';
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
      deleteEntitlementHandler,
    );
  },
  {
    name: 'delete-entitlement-routes',
    encapsulate: true,
  },
);
