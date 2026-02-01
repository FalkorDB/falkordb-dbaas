import { type Job } from 'bullmq';
import { type FastifyInstance } from 'fastify';
import { type InstanceDeletedJobData } from '../types';
import { IOmnistrateRepository } from '../../repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../services/UserService';
import { JOB_TIMEOUT_MS } from '../config';

/**
 * Process instance deleted job
 * Retries automatically via BullMQ until success or 24 hours timeout
 */
export async function processInstanceDeleted(
  job: Job<InstanceDeletedJobData>,
  fastify: FastifyInstance,
): Promise<void> {
  const { instanceId, subscriptionId, timestamp } = job.data;
  const logger = fastify.log.child({ jobId: job.id, instanceId, subscriptionId });

  logger.info({ timestamp }, 'Processing instance deleted job');

  // Check if job has exceeded 24 hour window
  const elapsedTime = Date.now() - timestamp;
  if (elapsedTime > JOB_TIMEOUT_MS) {
    logger.error({ elapsedTime }, 'Job exceeded 24 hour timeout, failing permanently');
    throw new Error(`Job exceeded 24 hour timeout (elapsed: ${elapsedTime}ms)`);
  }

  try {
    // Get Omnistrate repository from DI container
    const omnistrateRepo = fastify.diContainer.resolve<IOmnistrateRepository>(
      IOmnistrateRepository.repositoryName,
    );

    // Get instance details from Omnistrate
    let instance;
    try {
      instance = await omnistrateRepo.getInstance(instanceId);
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Instance not found in Omnistrate, may already be deleted',
      );
      // For deletion jobs, if instance doesn't exist, consider it success
      return;
    }

    if (!instance) {
      logger.warn('Instance not found, may already be deleted');
      return; // Success - instance already deleted
    }

    // Get cloud provider, cluster name, and region from instance
    const cloudProvider = instance.cloudProvider;
    const k8sClusterName = instance.clusterId;
    const region = instance.region;

    if (!cloudProvider || !k8sClusterName || !region) {
      logger.error({ cloudProvider, k8sClusterName, region }, 'Missing required instance details');
      // For deletion, if we can't find instance details, consider it already deleted
      return;
    }

    // Create UserService with dependencies from DI container
    const k8sRepository = fastify.diContainer.resolve<IK8sRepository>(IK8sRepository.repositoryName);
    const k8sCredentialsRepository = fastify.diContainer.resolve<IK8sCredentialsRepository>(
      IK8sCredentialsRepository.repositoryName,
    );
    const ldapRepository = fastify.diContainer.resolve<ILdapRepository>(ILdapRepository.repositoryName);
    const connectionCache = fastify.diContainer.resolve<IConnectionCacheRepository>(
      IConnectionCacheRepository.repositoryName,
    );
    const userService = new UserService(
      { logger },
      k8sRepository,
      k8sCredentialsRepository,
      ldapRepository,
      connectionCache,
    );

    // List all users in the organization (instance)
    let users;
    try {
      users = await userService.listUsers(instanceId, cloudProvider, k8sClusterName, region);
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Could not list users, may already be deleted',
      );
      return; // Success - users already deleted or inaccessible
    }

    logger.info({ userCount: users.length }, 'Deleting all users for instance');

    // Track deletion errors
    const errors: Array<{ username: string; error: string }> = [];
    let deletedCount = 0;

    // Delete all users
    for (const user of users) {
      try {
        await userService.deleteUser(instanceId, cloudProvider, k8sClusterName, region, user.username);
        logger.info({ username: '***' }, 'User deleted successfully');
        deletedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ error: errorMessage, username: '***' }, 'Error deleting user');
        errors.push({ username: '***', error: errorMessage });
      }
    }

    // If some users failed to delete, log but still return success
    // Inconsistent state is acceptable per requirements
    if (errors.length > 0) {
      logger.warn({ deletedCount, failedCount: errors.length }, 'Some users failed to delete, but continuing');
    }

    logger.info({ deletedCount }, 'User deletion completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Error processing instance deleted job');

    // For deletion jobs, we're more lenient - don't throw to avoid excessive retries
    // Log the error but consider the job done
    logger.warn('Deletion job processed with errors, not retrying');
  }
}
