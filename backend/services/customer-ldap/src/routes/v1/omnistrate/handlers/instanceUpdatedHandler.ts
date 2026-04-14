import { type FastifyReply, type FastifyRequest } from 'fastify';

interface InstanceUpdatedBody {
  payload: {
    instance_id: string;
    subscription_id: string;
  };
}

export async function instanceUpdatedHandler(
  request: FastifyRequest<{ Body: InstanceUpdatedBody }>,
  reply: FastifyReply,
): Promise<void> {
  const {
    payload: { instance_id: instanceId, subscription_id: subscriptionId },
  } = request.body;

  request.log.info({ instanceId, subscriptionId }, 'Received instance updated webhook');

  try {
    const queueManager = request.server.queueManager;

    if (!queueManager) {
      request.log.error('Queue manager not initialized');
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Queue manager not initialized',
      });
    }

    const jobId = await queueManager.addInstanceUpdatedJob({
      instanceId,
      subscriptionId,
    });

    request.log.info({ instanceId, subscriptionId, jobId }, 'Instance updated job queued successfully');

    return reply.code(202).send({
      message: 'Instance updated webhook accepted and queued for processing',
      jobId,
    });
  } catch (error) {
    request.log.error(
      { error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId },
      'Error queueing instance updated webhook',
    );

    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to queue webhook for processing - webhook will be retried',
    });
  }
}
