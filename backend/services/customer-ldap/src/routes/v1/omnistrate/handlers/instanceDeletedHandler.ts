import { type FastifyReply, type FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { UserService } from '../../../../services/UserService';

interface InstanceDeletedBody {
  instanceId: string;
  subscriptionId: string;
}

export async function instanceDeletedHandler(request: FastifyRequest<{ Body: InstanceDeletedBody }>, reply: FastifyReply): Promise<void> {
  const { instanceId, subscriptionId } = request.body;

  request.log.info({ instanceId, subscriptionId }, 'Handling instance deleted webhook');

  try {
    // Get Omnistrate repository from DI container
    const omnistrateRepo = request.diScope.resolve<IOmnistrateRepository>('omnistrateRepository');
    
    // Get instance details from Omnistrate
    let instance;
    try {
      instance = await omnistrateRepo.getInstance(instanceId);
    } catch (error) {
      request.log.warn({ instanceId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Instance not found in Omnistrate, may already be deleted');
      // For deletion webhooks, return 200 if instance doesn't exist (already deleted)
      return reply.code(200).send({ 
        message: 'Instance already deleted',
        deletedCount: 0,
      });
    }

    if (!instance) {
      request.log.warn({ instanceId }, 'Instance not found, may already be deleted');
      return reply.code(200).send({ 
        message: 'Instance already deleted',
        deletedCount: 0,
      });
    }

    // Get cloud provider, cluster name, and region from instance
    const cloudProvider = instance.cloudProvider;
    const k8sClusterName = instance.clusterId;
    const region = instance.region;

    if (!cloudProvider || !k8sClusterName || !region) {
      request.log.error({ instanceId, cloudProvider, k8sClusterName, region }, 'Missing required instance details');
      // For deletion, if we can't find instance details, consider it already deleted
      return reply.code(200).send({ 
        message: 'Instance metadata incomplete, considering already deleted',
        deletedCount: 0,
      });
    }

    // Get UserService from DI container
    const userService = request.diScope.resolve<UserService>('userService');
    
    // List all users in the organization (instance)
    let users;
    try {
      users = await userService.listUsers(instanceId, cloudProvider, k8sClusterName, region);
    } catch (error) {
      request.log.warn({ instanceId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Could not list users, may already be deleted');
      return reply.code(200).send({ 
        message: 'Users already deleted or inaccessible',
        deletedCount: 0,
      });
    }
    
    request.log.info({ instanceId, userCount: users.length }, 'Deleting all users for instance');

    // Track deletion errors
    const errors: Array<{ username: string; error: string }> = [];
    let deletedCount = 0;

    // Delete all users
    for (const user of users) {
      try {
        await userService.deleteUser(instanceId, cloudProvider, k8sClusterName, region, user.username);
        request.log.info({ instanceId, username: '***' }, 'User deleted successfully');
        deletedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        request.log.error({ error: errorMessage, instanceId, username: '***' }, 'Error deleting user');
        errors.push({ username: '***', error: errorMessage });
      }
    }

    // If some users failed to delete, log but still return success
    // Inconsistent state is acceptable per requirements
    if (errors.length > 0) {
      request.log.warn({ instanceId, deletedCount, failedCount: errors.length }, 'Some users failed to delete, but continuing');
    }

    request.log.info({ instanceId, deletedCount }, 'User deletion completed');
    
    return reply.code(200).send({ 
      message: 'User deletion completed',
      deletedCount,
      failedCount: errors.length,
    });
  } catch (error) {
    request.log.error({ error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId }, 'Error handling instance deleted webhook');
    
    // For deletion webhooks, always return 200 to prevent retries
    // Inconsistent state is acceptable per requirements
    return reply.code(200).send({ 
      message: 'Deletion webhook processed with errors',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
