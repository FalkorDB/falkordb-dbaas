import { type FastifyReply, type FastifyRequest } from 'fastify';

export async function authenticateWebhook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  const expectedSecret = request.server.config.OMNISTRATE_WEBHOOK_SECRET;

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return reply.unauthorized('Invalid webhook secret');
  }
}
