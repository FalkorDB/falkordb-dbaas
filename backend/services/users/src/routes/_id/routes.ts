import fp from 'fastify-plugin';
import {
  CreateUserRequestBodySchema,
  CreateUserRequestParamsSchema,
  CreateUserResponseBodySchema,
  DeleteUserRequestParamsSchema,
  GetUserRequestParamsSchema,
  GetUserResponseBodySchema,
  UpdateUserRequestBodySchema,
  UpdateUserRequestParamsSchema,
  UpdateUserResponseBodySchema,
} from '@falkordb/schemas/services/users/v1';
import { getUserHandler } from './handlers/get';
import { createUserHandler } from './handlers/create';
import { updateUserHandler } from './handlers/update';
import { deleteUserHandler } from './handlers/delete';

export default fp(
  async function userId(fastify, opts) {
    fastify.get(
      '/',
      {
        schema: {
          tags: ['users'],
          params: GetUserRequestParamsSchema,
          response: {
            200: GetUserResponseBodySchema,
          },
        },
      },
      getUserHandler,
    );

    fastify.post(
      '/',
      {
        schema: {
          tags: ['users'],
          params: CreateUserRequestParamsSchema,
          body: CreateUserRequestBodySchema,
          response: {
            200: CreateUserResponseBodySchema,
          },
        },
      },
      createUserHandler,
    );

    fastify.put(
      '/',
      {
        schema: {
          tags: ['users'],
          params: UpdateUserRequestParamsSchema,
          body: UpdateUserRequestBodySchema,
          response: {
            200: UpdateUserResponseBodySchema,
          },
        },
      },
      updateUserHandler,
    );

    fastify.delete(
      '/',
      {
        schema: {
          tags: ['users'],
          params: DeleteUserRequestParamsSchema,
        },
      },
      deleteUserHandler,
    );
  },
  {
    name: 'userId-routes',
    encapsulate: true,
  },
);
