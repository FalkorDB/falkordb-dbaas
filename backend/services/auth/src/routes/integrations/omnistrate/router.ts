import { GetOmnistrateTokenHeadersSchema } from '@falkordb/schemas/dist/services/auth/v1';
import fp from 'fastify-plugin';
import { getOmnistrateTokenHandler } from './handlers/getOmnistrateTokenHandler';

export default fp(
  async function getToken(fastify, opts) {
    fastify.get(
      '/omnistrate/token',
      {
        schema: {
          tags: ['integrations', 'omnisrate'],
          headers: GetOmnistrateTokenHeadersSchema,
        },
      },
      getOmnistrateTokenHandler,
    );
  },
  {
    name: 'integrations-omnistrate-get-token-routes',
  },
);
