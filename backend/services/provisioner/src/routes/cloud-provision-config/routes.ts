import fp from 'fastify-plugin';
import {
  CloudProvisionConfigCreateBodySchema,
  CloudProvisionConfigCreateBodySchemaType,
  CloudProvisionConfigCreateResponseSuccessSchema,
} from './schemas/create';
import { cloudProvisionConfigCreateHandler } from './handlers/create';
import { CloudProvisionConfigDeleteParamsSchema } from './schemas/delete';
import { cloudProvisionConfigDeleteHandler } from './handlers/delete';
import { CloudProvisionConfigListQuerySchema, CloudProvisionConfigListQuerySchemaType } from './schemas/list';
import { cloudProvisionConfigListHandler } from './handlers/list';

export default fp(
  async function provision(fastify, opts) {
    fastify.post<{ Body: CloudProvisionConfigCreateBodySchemaType }>(
      '/',
      {
        schema: {
          body: CloudProvisionConfigCreateBodySchema,
          response: {
            200: CloudProvisionConfigCreateResponseSuccessSchema,
          },
        },
      },
      cloudProvisionConfigCreateHandler,
    );

    fastify.get<{ Querystring: CloudProvisionConfigListQuerySchemaType }>(
      '/',
      {
        schema: {
          querystring: CloudProvisionConfigListQuerySchema,
        },
      },
      cloudProvisionConfigListHandler,
    );

    fastify.delete(
      '/:id',
      {
        schema: {
          params: CloudProvisionConfigDeleteParamsSchema,
        },
      },
      cloudProvisionConfigDeleteHandler,
    );
  },
  {
    name: 'cloud-provision-config-routes',
    encapsulate: true,
  },
);
