import { type FastifyReply, type FastifyRequest } from 'fastify';
import { IOmnistrateRepository } from '../../../../repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../../../repositories/k8s/IK8sRepository';
import { ILdapRepository } from '../../../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../../../services/UserService';

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

  request.log.info({ instanceId, subscriptionId }, 'Handling instance deleted webhook');

  try {
    // Get Omnistrate repository from DI container
    const omnistrateRepo = request.diScope.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);

    // Get instance details from Omnistrate
    let instance;
    try {
      instance = await omnistrateRepo.getInstance(instanceId);
    } catch (error) {
      request.log.warn(
        { instanceId, error: error instanceof Error ? error.message : 'Unknown error' },
        'Instance not found in Omnistrate, may already be deleted',
      );
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

    // Create UserService with dependencies from DI container
    const k8sRepository = request.diScope.resolve<IK8sRepository>(IK8sRepository.repositoryName);
    const ldapRepository = request.diScope.resolve<ILdapRepository>(ILdapRepository.repositoryName);
    const connectionCache = request.diScope.resolve<IConnectionCacheRepository>(IConnectionCacheRepository.repositoryName);
    const userService = new UserService({ logger: request.log }, k8sRepository, ldapRepository, connectionCache);

    // List all users in the organization (instance)
    let users;
    try {
      users = await userService.listUsers(instanceId, cloudProvider, k8sClusterName, region);
    } catch (error) {
      request.log.warn(
        { instanceId, error: error instanceof Error ? error.message : 'Unknown error' },
        'Could not list users, may already be deleted',
      );
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
      request.log.warn(
        { instanceId, deletedCount, failedCount: errors.length },
        'Some users failed to delete, but continuing',
      );
    }

    request.log.info({ instanceId, deletedCount }, 'User deletion completed');

    return reply.code(200).send({
      message: 'User deletion completed',
      deletedCount,
      failedCount: errors.length,
    });
  } catch (error) {
    request.log.error(
      { error: error instanceof Error ? error.message : 'Unknown error', instanceId, subscriptionId },
      'Error handling instance deleted webhook',
    );

    // For deletion webhooks, always return 200 to prevent retries
    // Inconsistent state is acceptable per requirements
    return reply.code(200).send({
      message: 'Deletion webhook processed with errors',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
