import { type Job } from 'bullmq';
import { type FastifyInstance } from 'fastify';
import { type InstanceCreatedJobData } from '../types';
import { IOmnistrateRepository } from '../../repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../services/UserService';
import { ALLOWED_ACL } from '../../constants';
import { JOB_TIMEOUT_MS } from '../config';

/**
 * Process instance created job
 * Retries automatically via BullMQ until success or 24 hours timeout
 */
export async function processInstanceCreated(
  job: Job<InstanceCreatedJobData>,
  fastify: FastifyInstance,
): Promise<void> {
  const { instanceId, subscriptionId, timestamp } = job.data;
  const logger = fastify.log.child({ jobId: job.id, instanceId, subscriptionId });

  logger.info({ timestamp }, 'Processing instance created job');

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
    const instance = await omnistrateRepo.getInstance(instanceId);

    if (!instance) {
      logger.error('Instance not found in Omnistrate');
      throw new Error(`Instance ${instanceId} not found in Omnistrate - will retry`);
    }

    // Extract FalkorDB credentials from resultParams
    const resultParams = instance.resultParams || {};
    const falkordbUsername = resultParams.falkordbUser;
    const falkordbPassword = resultParams.falkordbPassword;

    if (!falkordbUsername || !falkordbPassword) {
      logger.error({ hasResultParams: !!instance.resultParams }, 'Missing FalkorDB credentials in resultParams');
      throw new Error('Missing falkordbUsername or falkordbPassword in instance resultParams - will retry');
    }

    // Get cloud provider, cluster name, and region from instance
    const cloudProvider = instance.cloudProvider;
    const k8sClusterName = instance.clusterId;
    const region = instance.region;

    if (!cloudProvider || !k8sClusterName || !region) {
      logger.error({ cloudProvider, k8sClusterName, region }, 'Missing required instance details');
      throw new Error('Missing cloud_provider, cluster name, or region in instance - will retry');
    }

    // Create user in LDAP with ALLOWED_ACL permissions
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

    try {
      await userService.createUser(instanceId, cloudProvider, k8sClusterName, region, {
        username: falkordbUsername,
        password: falkordbPassword,
        acl: `~* ${ALLOWED_ACL}`,
      });

      logger.info({ username: '***' }, 'User created successfully');
    } catch (error) {
      // Check if user already exists (idempotency)
      if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
        logger.info('User already exists - job is idempotent');
        return; // Success - user already exists
      }

      // Check for rate limiting
      if (error instanceof Error && error.message.includes('429')) {
        logger.warn('Rate limited by LDAP server');
        throw new Error('LDAP server rate limit reached - will retry');
      }

      // For other errors, throw to trigger retry
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Error processing instance created job');

    // Re-throw to trigger BullMQ retry
    throw new Error(`Failed to process instance created: ${errorMessage}`);
  }
}
