import fp from 'fastify-plugin';
import { Type } from '@sinclair/typebox';
import { instanceCreatedHandler } from './handlers/instanceCreatedHandler';
import { instanceDeletedHandler } from './handlers/instanceDeletedHandler';
import { instanceUpdatedHandler } from './handlers/instanceUpdatedHandler';
import { instanceRestoredHandler } from './handlers/instanceRestoredHandler';
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

    // Webhook: Instance Updated
    fastify.post(
      '/v1/omnistrate/instance-updated',
      {
        onRequest: [authenticateWebhook],
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['Omnistrate Webhooks'],
          description:
            'Webhook handler for instance update events from Omnistrate. Syncs the principal user password to LDAP.',
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
      instanceUpdatedHandler,
    );

    // Webhook: Instance Restored
    fastify.post(
      '/v1/omnistrate/instance-restored',
      {
        onRequest: [authenticateWebhook],
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['Omnistrate Webhooks'],
          description:
            'Webhook handler for instance restoration events from Omnistrate. Re-creates the principal LDAP user after restore.',
          body: Type.Object(
            {
              payload: Type.Object(
                {
                  instance_id: Type.String({ description: 'Omnistrate instance ID of the restored instance' }),
                  subscription_id: Type.String({ description: 'Omnistrate subscription ID' }),
                  source_instance_id: Type.Optional(
                    Type.String({ description: 'Omnistrate instance ID of the source (snapshot origin) instance' }),
                  ),
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
      instanceRestoredHandler,
    );
  },
  {
    name: 'v1-omnistrate-routes',
  },
);
