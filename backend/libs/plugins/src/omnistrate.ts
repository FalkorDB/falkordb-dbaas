import fp from 'fastify-plugin';
import {
  type RawServerDefault,
  type FastifyPluginCallback,
  type FastifyTypeProviderDefault,
  type FastifyBaseLogger,
  type FastifyRequest,
} from 'fastify';
import { ApiError } from '@falkordb/errors';
import { decode, JwtPayload } from 'jsonwebtoken';

interface IOmnistratePluginOptions {
  omnistrateRepository: {
    validate: (token: string) => Promise<boolean>;
  };
}

export default fp<IOmnistratePluginOptions>(
  async (fastify, opts) => {
    fastify.decorate('authenticateOmnistrate', async (request: FastifyRequest) => {
      try {
        const token = request.headers['authorization']?.split(' ')[1];
        if (!token) {
          throw ApiError.unauthorized('Token is missing', 'TOKEN_MISSING');
        }

        const valid = await opts.omnistrateRepository.validate(token);
        if (!valid) {
          throw ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
        }
      } catch (error) {
        request.log.error(error, 'Error validating token:');
        if (error instanceof ApiError) {
          throw error.toFastify(request.server);
        }

        throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
      }
    });
  },
  {
    name: 'omnistrate-plugin',
  },
) as FastifyPluginCallback<IOmnistratePluginOptions, RawServerDefault, FastifyTypeProviderDefault, FastifyBaseLogger>;
