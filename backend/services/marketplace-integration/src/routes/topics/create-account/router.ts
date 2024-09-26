import fp from 'fastify-plugin';
import { createAccountHandler } from './handlers/createAccountHandler';
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
      createAccountHandler,
    );
  },
  {
    name: 'create-account-routes',
    encapsulate: true,
  },
);
