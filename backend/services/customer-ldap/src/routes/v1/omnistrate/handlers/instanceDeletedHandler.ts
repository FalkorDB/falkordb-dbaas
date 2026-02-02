import { type FastifyReply, type FastifyRequest } from 'fastify';
import { QueueManager } from '../../../../queues/QueueManager';

interface InstanceDeletedBody {
  payload: {
    instance_id: string;
    subscription_id: string;
  };
}

export async function instanceDeletedHandler(
  request: FastifyRequest<{ Body: InstanceDeletedBody }>,
  reply: FastifyReply,
): Promise<void> {
  const {
    payload: { instance_id: instanceId, subscription_id: subscriptionId },
  } = request.body;

  request.log.info({ instanceId, subscriptionId }, 'Received instance deleted webhook');

  try {
    // Get queue manager from Fastify instance
    const queueManager = request.server.queueManager;

    if (!queueManager) {
      request.log.error('Queue manager not initialized');
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Queue manager not initialized',
      });
    }

    // Add job to queue for asynchronous processing with retry
    const jobId = await queueManager.addInstanceDeletedJob({
      instanceId,
      subscriptionId,
    });

    request.log.info({ instanceId, subscriptionId, jobId }, 'Instance deleted job queued successfully');

    // Return 202 Accepted to indicate webhook is being processed asynchronously
    return reply.code(202).send({
      message: 'Instance deleted webhook accepted and queued for processing',
      jobId,
    });
  } catch (error) {
    request.log.error(
      { error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId },
      'Error queueing instance deleted webhook',
    );

    // Return 500 to trigger webhook retry at Omnistrate side
    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to queue webhook for processing - webhook will be retried',
    });
  }
}
