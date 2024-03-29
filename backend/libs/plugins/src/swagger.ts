import fp from 'fastify-plugin';
import SwaggerUI from '@fastify/swagger-ui';
import Swagger, { type FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import {
  type RawServerDefault,
  type FastifyPluginAsync,
  type FastifyTypeProviderDefault,
  type FastifyBaseLogger,
} from 'fastify';

export default fp<FastifyDynamicSwaggerOptions>(async (fastify, opts) => {
  await fastify.register(Swagger, {
    openapi: {
      info: {
        title: opts.swagger?.info?.title ?? 'FalkorDB',
        description: opts.swagger?.info?.description ?? 'API Endpoints for FalkorDB Provisioner',
        version: opts.swagger?.info?.version ?? '0.1.0',
      },
      servers: [
        {
          url: `http://0.0.0.0:${process.env.PORT}`,
        },
      ],
      tags: opts.swagger.tags,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    await fastify.register(SwaggerUI, {
      routePrefix: '/docs',
    });
  }
}, {
  name: 'swagger-plugin',
}) as FastifyPluginAsync<FastifyDynamicSwaggerOptions, RawServerDefault, FastifyTypeProviderDefault, FastifyBaseLogger>;
