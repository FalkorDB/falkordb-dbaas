import { type Job } from 'bullmq';
import { type FastifyInstance } from 'fastify';
import { type InstanceUpdatedJobData } from '../types';
import { IOmnistrateRepository } from '../../repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../services/UserService';
import { JOB_TIMEOUT_MS } from '../config';

/**
 * Process instance updated job.
 *
 * Syncs the principal user's (falkordbUser) password from Omnistrate resultParams
 * to LDAP whenever the instance is updated.  Password changes for the principal user
 * must go through the Omnistrate API — the customer-ldap API forbids modifying the
 * principal user's password directly.
 */
export async function processInstanceUpdated(
  job: Job<InstanceUpdatedJobData>,
  fastify: FastifyInstance,
): Promise<void> {
  const { instanceId, subscriptionId, timestamp } = job.data;
  const logger = fastify.log.child({ jobId: job.id, instanceId, subscriptionId });

  logger.info({ timestamp }, 'Processing instance updated job');

  // Check if job has exceeded 24 hour window
  const elapsedTime = Date.now() - timestamp;
  if (elapsedTime > JOB_TIMEOUT_MS) {
    logger.error({ elapsedTime }, 'Job exceeded 24 hour timeout, failing permanently');
    throw new Error(`Job exceeded 24 hour timeout (elapsed: ${elapsedTime}ms)`);
  }

  try {
    const omnistrateRepo = fastify.diContainer.resolve<IOmnistrateRepository>(
      IOmnistrateRepository.repositoryName,
    );

    const instance = await omnistrateRepo.getInstance(instanceId);

    if (!instance) {
      logger.error('Instance not found in Omnistrate');
      throw new Error(`Instance ${instanceId} not found in Omnistrate - will retry`);
    }

    const resultParams = instance.resultParams || {};
    const falkordbUsername = resultParams.falkordbUser;
    const falkordbPassword = resultParams.falkordbPassword;

    if (!falkordbUsername || !falkordbPassword) {
      logger.error({ hasResultParams: !!instance.resultParams }, 'Missing FalkorDB credentials in resultParams');
      throw new Error('Missing falkordbUser or falkordbPassword in instance resultParams - will retry');
    }

    const cloudProvider = instance.cloudProvider;
    const k8sClusterName = instance.clusterId;
    const region = instance.region;

    if (!cloudProvider || !k8sClusterName || !region) {
      logger.error({ cloudProvider, k8sClusterName, region }, 'Missing required instance details');
      throw new Error('Missing cloudProvider, clusterId, or region in instance - will retry');
    }

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
      await userService.modifyUser(instanceId, cloudProvider, k8sClusterName, region, falkordbUsername, {
        password: falkordbPassword,
      });

      logger.info({ instanceId }, 'Principal user password synced to LDAP successfully');
    } catch (error) {
      if (error instanceof Error && error.message.includes('429')) {
        logger.warn('Rate limited by LDAP server');
        throw new Error('LDAP server rate limit reached - will retry');
      }
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Error processing instance updated job');
    throw new Error(`Failed to process instance updated: ${errorMessage}`);
  }
}
