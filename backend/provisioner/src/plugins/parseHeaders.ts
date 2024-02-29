import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify/types/request';
import type { FastifyReply } from 'fastify';
import { RequestHeaderSchemaType } from '../schemas/request';

export default fp(
  async function parseHeadersPlugin(fastify, opts) {
    fastify.decorate(
      'parseHeaders',
      function parseHeaders(request: FastifyRequest, reply: FastifyReply, requiredHeaders: string[] = []) {
        if (requiredHeaders.includes('x-falkordb-organizationId') && !request.headers['x-falkordb-organizationId']) {
          reply.code(400);
          throw new Error('Header \'x-falkordb-organizationId\' is required');
        }

        if (requiredHeaders.includes('x-falkordb-userId') && !request.headers['x-falkordb-userId']) {
          reply.code(400);
          throw new Error('Header \'x-falkordb-userId\' is required');
        }

        return {
          organizationId: request.headers['x-falkordb-organizationId'],
          userId: request.headers['x-falkordb-userId'],
        } as RequestHeaderSchemaType;
      },
    );
  },
  {
    name: 'parse-headers-plugin',
  },
);
