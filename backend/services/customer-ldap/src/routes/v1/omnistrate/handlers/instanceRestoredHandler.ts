import { type FastifyReply, type FastifyRequest } from 'fastify';

interface InstanceRestoredBody {
  payload: {
    instance_id: string;
    subscription_id: string;
    source_instance_id?: string;
  };
}

export async function instanceRestoredHandler(
  request: FastifyRequest<{ Body: InstanceRestoredBody }>,
  reply: FastifyReply,
): Promise<void> {
  const {
    payload: { instance_id: instanceId, subscription_id: subscriptionId, source_instance_id: sourceInstanceId },
  } = request.body;

  request.log.info({ instanceId, subscriptionId, sourceInstanceId }, 'Received instance restored webhook');

  try {
    const queueManager = request.server.queueManager;

    if (!queueManager) {
      request.log.error('Queue manager not initialized');
      return reply.code(500).send({
        error: 'Internal server error',
        message: 'Queue manager not initialized',
      });
    }

    const jobId = await queueManager.addInstanceRestoredJob({
      instanceId,
      subscriptionId,
      sourceInstanceId,
    });

    request.log.info({ instanceId, subscriptionId, sourceInstanceId, jobId }, 'Instance restored job queued successfully');

    return reply.code(202).send({
      message: 'Instance restored webhook accepted and queued for processing',
      jobId,
    });
  } catch (error) {
    request.log.error(
      { error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId },
      'Error queueing instance restored webhook',
    );

    return reply.code(500).send({
      error: 'Internal server error',
      message: 'Failed to queue webhook for processing - webhook will be retried',
    });
  }
}
