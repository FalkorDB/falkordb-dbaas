import fp from 'fastify-plugin';
import { cloudProvisionConfigCreateHandler } from './handlers/create';
import {
  CloudProvisionConfigDeleteParamsSchema,
  CloudProvisionConfigListQuerySchema,
  CloudProvisionConfigListQuerySchemaType,
  CloudProvisionConfigCreateBodySchema,
  CloudProvisionConfigCreateBodySchemaType,
  CloudProvisionConfigCreateResponseSuccessSchema,
} from '@falkordb/schemas/dist/services/provisioner/v1/cloud-provision-config';
import { cloudProvisionConfigDeleteHandler } from './handlers/delete';
import { cloudProvisionConfigListHandler } from './handlers/list';

export default fp(
  async function config(fastify, opts) {
    fastify.post<{ Body: CloudProvisionConfigCreateBodySchemaType }>(
      '/',
      {
        schema: {
          tags: ['cloud-provision-config'],
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
          tags: ['cloud-provision-config'],
          querystring: CloudProvisionConfigListQuerySchema,
        },
      },
      cloudProvisionConfigListHandler,
    );

    fastify.delete(
      '/:id',
      {
        schema: {
          tags: ['cloud-provision-config'],
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
