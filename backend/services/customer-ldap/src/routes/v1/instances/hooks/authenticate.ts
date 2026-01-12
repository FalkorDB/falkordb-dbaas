import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ISessionRepository, SessionData } from '../../../../repositories/session/ISessionRepository';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { AuthService } from '../../../../services/AuthService';
import { SESSION_COOKIE_NAME, SESSION_EXPIRY_SECONDS } from '../../../../constants';

declare module 'fastify' {
  interface FastifyRequest {
    sessionData: SessionData;
  }
}

export function createAuthenticateHook(
  requiredPermission: 'reader' | 'writer',
): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const opts = { logger: request.log };
    const { instanceId } = request.params as { instanceId: string };
    const { subscriptionId } = request.query as { subscriptionId: string };

    // Check for session cookie first
    const sessionCookie = request.cookies[SESSION_COOKIE_NAME];
    let sessionData: SessionData | null = null;

    const sessionRepository = request.diScope.resolve<ISessionRepository>(
      ISessionRepository.repositoryName,
    );

    if (sessionCookie) {
      sessionData = sessionRepository.decodeSession(sessionCookie);

      // Validate session matches the request
      if (
        sessionData &&
        sessionData.instanceId === instanceId &&
        sessionData.subscriptionId === subscriptionId
      ) {
        // Check if user has required permissions
        const authService = new AuthService(opts, null as unknown as IOmnistrateRepository, sessionRepository);
        if (!authService.checkPermission(sessionData.role, requiredPermission)) {
          throw request.server.httpErrors.forbidden('Insufficient permissions');
        }
      } else {
        sessionData = null;
      }
    }

    // If no valid session, authenticate with Omnistrate
    if (!sessionData) {
      const authHeader = request.headers['authorization'] as string | undefined;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw request.server.httpErrors.unauthorized('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);
      const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(
        IOmnistrateRepository.repositoryName,
      );

      const authService = new AuthService(opts, omnistrateRepository, sessionRepository);

      const { session, sessionData: newSessionData } =
        await authService.authenticateAndAuthorize(
          token,
          instanceId,
          subscriptionId,
          requiredPermission,
        );

      sessionData = newSessionData;

      // Set session cookie (15 minutes)
      reply.setCookie(SESSION_COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_EXPIRY_SECONDS,
        path: '/',
      });
    }

    // Attach sessionData to request for use in handler
    request.sessionData = sessionData;
  };
}
