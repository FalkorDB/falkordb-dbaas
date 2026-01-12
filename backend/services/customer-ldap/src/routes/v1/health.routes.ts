import fp from 'fastify-plugin';
import { Type } from '@sinclair/typebox';

export default fp(async function healthRoutes(fastify) {
  // Liveness probe
  fastify.get(
    '/v1/health',
    {
      schema: {
        tags: ['Health'],
        description: 'Liveness probe - checks if service is running',
        response: {
          200: Type.Object({
            status: Type.Literal('ok'),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      return {
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Readiness probe
  fastify.get(
    '/v1/readiness',
    {
      schema: {
        tags: ['Health'],
        description: 'Readiness probe - checks if service can handle requests',
        response: {
          200: Type.Object({
            status: Type.Literal('ready'),
            timestamp: Type.String(),
          }),
        },
      },
    },
    async () => {
      return {
        status: 'ready' as const,
        timestamp: new Date().toISOString(),
      };
    }
  );
}, {
  name: 'v1-health-routes',
});
