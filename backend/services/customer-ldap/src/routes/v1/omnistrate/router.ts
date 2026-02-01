import fp from 'fastify-plugin';
import { Type } from '@sinclair/typebox';
import { instanceCreatedHandler } from './handlers/instanceCreatedHandler';
import { instanceDeletedHandler } from './handlers/instanceDeletedHandler';
import { authenticateWebhook } from './hooks/authenticateWebhook';

export default fp(
  async function omnistrateRoutes(fastify) {
    // Webhook: Instance Created
    fastify.post(
      '/v1/omnistrate/instance-created',
      {
        onRequest: [authenticateWebhook],
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['Omnistrate Webhooks'],
          description: 'Webhook handler for instance creation events from Omnistrate',
          body: Type.Object(
            {
              payload: Type.Object(
                {
                  instance_id: Type.String({ description: 'Omnistrate instance ID' }),
                  subscription_id: Type.String({ description: 'Omnistrate subscription ID' }),
                },
                { additionalProperties: true },
              ),
            },
            { additionalProperties: true },
          ),
          response: {
            202: Type.Object({
              message: Type.String(),
              jobId: Type.String(),
            }),
            500: Type.Object({
              error: Type.String(),
              message: Type.String(),
            }),
          },
        },
      },
      instanceCreatedHandler,
    );

    // Webhook: Instance Deleted
    fastify.post(
      '/v1/omnistrate/instance-deleted',
      {
        onRequest: [authenticateWebhook],
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['Omnistrate Webhooks'],
          description: 'Webhook handler for instance deletion events from Omnistrate',
          body: Type.Object(
            {
              payload: Type.Object(
                {
                  instance_id: Type.String({ description: 'Omnistrate instance ID' }),
                  subscription_id: Type.String({ description: 'Omnistrate subscription ID' }),
                },
                { additionalProperties: true },
              ),
            },
            { additionalProperties: true },
          ),
          response: {
            202: Type.Object({
              message: Type.String(),
              jobId: Type.String(),
            }),
            500: Type.Object({
              error: Type.String(),
              message: Type.String(),
            }),
          },
        },
      },
      instanceDeletedHandler,
    );
  },
  {
    name: 'v1-omnistrate-routes',
  },
);
