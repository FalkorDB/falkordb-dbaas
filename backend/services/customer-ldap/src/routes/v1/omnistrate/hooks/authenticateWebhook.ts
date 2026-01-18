import { type FastifyReply, type FastifyRequest } from 'fastify';
import { timingSafeEqual } from 'crypto';

export async function authenticateWebhook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  const expectedSecret = request.server.config.OMNISTRATE_WEBHOOK_SECRET;

  if (!expectedSecret) {
    request.log.error('OMNISTRATE_WEBHOOK_SECRET is not configured');
    return reply.unauthorized('Webhook authentication not configured');
  }

  const expectedToken = `Bearer ${expectedSecret}`;
  if (
    !authHeader ||
    authHeader.length !== expectedToken.length ||
    !timingSafeEqual(Buffer.from(authHeader) as Uint8Array, Buffer.from(expectedToken) as Uint8Array)
  ) {
    return reply.unauthorized('Invalid webhook secret');
  }
}
