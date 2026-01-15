import fp from 'fastify-plugin';
import {
  ListUsersResponseSchema,
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  ModifyUserRequestSchema,
  ModifyUserResponseSchema,
  DeleteUserResponseSchema,
  InstanceIdParamSchema,
  UsernameParamSchema,
  SubscriptionIdQuerySchema,
} from '../../../schemas/users';
import { listUsersHandler } from './handlers/listUsersHandler';
import { createUserHandler } from './handlers/createUserHandler';
import { modifyUserHandler } from './handlers/modifyUserHandler';
import { deleteUserHandler } from './handlers/deleteUserHandler';
import { createAuthenticateHook } from './hooks/authenticate';

export default fp(
  async function instancesRoutes(fastify) {
    // List users - GET /v1/instances/:instanceId/users
    fastify.get(
      '/v1/instances/:instanceId/users',
      {
        preHandler: createAuthenticateHook('reader'),
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['users'],
          params: InstanceIdParamSchema,
          querystring: SubscriptionIdQuerySchema,
          response: {
            200: ListUsersResponseSchema,
          },
        },
      },
      listUsersHandler,
    );

    // Create user - POST /v1/instances/:instanceId/users
    fastify.post(
      '/v1/instances/:instanceId/users',
      {
        preHandler: createAuthenticateHook('writer'),
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['users'],
          params: InstanceIdParamSchema,
          querystring: SubscriptionIdQuerySchema,
          body: CreateUserRequestSchema,
          response: {
            200: CreateUserResponseSchema,
          },
        },
      },
      createUserHandler,
    );

    // Modify user - PUT /v1/instances/:instanceId/users/:username
    fastify.put(
      '/v1/instances/:instanceId/users/:username',
      {
        preHandler: createAuthenticateHook('writer'),
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['users'],
          params: UsernameParamSchema,
          querystring: SubscriptionIdQuerySchema,
          body: ModifyUserRequestSchema,
          response: {
            200: ModifyUserResponseSchema,
          },
        },
      },
      modifyUserHandler,
    );

    // Delete user - DELETE /v1/instances/:instanceId/users/:username
    fastify.delete(
      '/v1/instances/:instanceId/users/:username',
      {
        preHandler: createAuthenticateHook('writer'),
        schema: {
          security: [{ bearerAuth: [] }],
          tags: ['users'],
          params: UsernameParamSchema,
          querystring: SubscriptionIdQuerySchema,
          response: {
            200: DeleteUserResponseSchema,
          },
        },
      },
      deleteUserHandler,
    );
  },
  {
    name: 'v1-instances-routes',
  },
);
