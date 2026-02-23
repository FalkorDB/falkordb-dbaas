import { FastifyRequest, FastifyReply, preHandlerHookHandler } from 'fastify';
import { ISessionRepository, SessionData } from '../../../../repositories/session/ISessionRepository';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { AuthService } from '../../../../services/AuthService';
import { GcpServiceAccountValidator } from '../../../../services/GcpServiceAccountValidator';
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

    if (!instanceId || !subscriptionId) {
      throw request.server.httpErrors.badRequest('Missing required instanceId or subscriptionId');
    }

    // Check for session cookie first (using signed cookies for security)
    const sessionCookie = request.cookies[SESSION_COOKIE_NAME] as string | undefined;
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
        if (!AuthService.checkPermission(sessionData.role, requiredPermission)) {
          throw request.server.httpErrors.forbidden('Insufficient permissions');
        }
      } else {
        sessionData = null;
      }
    }

    // If no valid session, authenticate with Omnistrate or GCP service account
    if (!sessionData) {
      const authHeaderRaw = request.headers['authorization'];
      const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw request.server.httpErrors.unauthorized('Missing or invalid authorization header');
      }

      const token = authHeader.substring(7);

      // First, try to validate as GCP service account token
      const gcpValidator = new GcpServiceAccountValidator({
        logger: request.log,
        adminServiceAccountEmail: process.env.GCP_ADMIN_SERVICE_ACCOUNT_EMAIL,
      });

      const isGcpServiceAccount = await gcpValidator.validateServiceAccountToken(token);

      if (isGcpServiceAccount) {
        // GCP service account has root access to all instances
        request.log.info({ instanceId, subscriptionId }, 'Authenticated as GCP admin service account');

        // Get instance details to populate session data
        const omnistrateRepository = request.diScope.resolve<IOmnistrateRepository>(
          IOmnistrateRepository.repositoryName,
        );
        const instance = await omnistrateRepository.getInstance(instanceId);

        // Validate subscription ID matches
        if (instance.subscriptionId !== subscriptionId) {
          throw request.server.httpErrors.badRequest('Subscription ID does not match instance');
        }

        // Create session data with root role for GCP service account
        sessionData = {
          userId: gcpValidator.getAdminServiceAccountEmail() || 'gcp-admin',
          subscriptionId,
          instanceId,
          cloudProvider: instance.cloudProvider,
          region: instance.region,
          k8sClusterName: instance.clusterId,
          role: 'root',
        };

        // Create and set session cookie
        const session = sessionRepository.createSession(sessionData);
        reply.setCookie(SESSION_COOKIE_NAME, session, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: SESSION_EXPIRY_SECONDS,
          path: '/',
          signed: true,
        });
      } else {
        // Fall back to Omnistrate authentication
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
          secure: true, // Always use secure flag for sensitive session cookies
          sameSite: 'strict',
          maxAge: SESSION_EXPIRY_SECONDS,
          path: '/',
          signed: true, // Sign the cookie to prevent tampering
        });
      }
    }

    // Attach sessionData to request for use in handler
    request.sessionData = sessionData;
  };
}
