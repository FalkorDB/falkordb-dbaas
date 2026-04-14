import { type Job } from 'bullmq';
import { randomBytes } from 'crypto';
import { type FastifyInstance } from 'fastify';
import { type InstanceRestoredJobData } from '../types';
import { IOmnistrateRepository } from '../../repositories/omnistrate/IOmnistrateRepository';
import { IK8sRepository } from '../../repositories/k8s/IK8sRepository';
import { IK8sCredentialsRepository } from '../../repositories/k8s-credentials/IK8sCredentialsRepository';
import { ILdapRepository } from '../../repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../repositories/connection-cache/IConnectionCacheRepository';
import { UserService } from '../../services/UserService';
import { ALLOWED_ACL } from '../../constants';
import { JOB_TIMEOUT_MS } from '../config';

/**
 * Process instance restored job.
 *
 * 1. Re-creates (or re-syncs the password of) the principal user (falkordbUser) in the
 *    restored instance's LDAP.
 *
 * 2. If a sourceInstanceId is present in the job data, lists all non-principal LDAP users
 *    from the source instance and creates them in the restored instance, preserving their
 *    ACL.  Because LDAP passwords are write-only, each synced user is given a random
 *    initial password — users must reset their passwords after restoration.
 */
export async function processInstanceRestored(
  job: Job<InstanceRestoredJobData>,
  fastify: FastifyInstance,
): Promise<void> {
  const { instanceId, subscriptionId, sourceInstanceId, timestamp } = job.data;
  const logger = fastify.log.child({ jobId: job.id, instanceId, subscriptionId, sourceInstanceId });

  logger.info({ timestamp }, 'Processing instance restored job');

  const elapsedTime = Date.now() - timestamp;
  if (elapsedTime > JOB_TIMEOUT_MS) {
    logger.error({ elapsedTime }, 'Job exceeded 24 hour timeout, failing permanently');
    throw new Error(`Job exceeded 24 hour timeout (elapsed: ${elapsedTime}ms)`);
  }

  try {
    const omnistrateRepo = fastify.diContainer.resolve<IOmnistrateRepository>(IOmnistrateRepository.repositoryName);

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

    // Step 1: re-create / re-sync the principal user in the restored instance
    try {
      await userService.createUser(instanceId, cloudProvider, k8sClusterName, region, {
        username: falkordbUsername,
        password: falkordbPassword,
        acl: `~* ${ALLOWED_ACL}`,
      });
      logger.info({ username: '***' }, 'Principal user re-created in LDAP after restoration');
    } catch (error) {
      if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
        logger.info('Principal user already exists in LDAP - syncing password instead');
        await userService.modifyUser(instanceId, cloudProvider, k8sClusterName, region, falkordbUsername, {
          password: falkordbPassword,
        });
        logger.info({ username: '***' }, 'Principal user password synced after restoration');
      } else if (error instanceof Error && error.message.includes('429')) {
        logger.warn('Rate limited by LDAP server');
        throw new Error('LDAP server rate limit reached - will retry');
      } else {
        throw error;
      }
    }

    // Step 2: sync non-principal users from the source instance (if provided)
    if (!sourceInstanceId) {
      logger.info({ instanceId }, 'No sourceInstanceId provided — skipping non-principal user sync');
      return;
    }

    logger.info({ instanceId, sourceInstanceId }, 'Syncing non-principal LDAP users from source instance');

    let sourceInstance;
    try {
      sourceInstance = await omnistrateRepo.getInstance(sourceInstanceId);
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Could not fetch source instance — skipping non-principal user sync',
      );
      return;
    }

    const sourceCloudProvider = sourceInstance.cloudProvider;
    const sourceK8sClusterName = sourceInstance.clusterId;
    const sourceRegion = sourceInstance.region;

    if (!sourceCloudProvider || !sourceK8sClusterName || !sourceRegion) {
      logger.warn(
        { sourceCloudProvider, sourceK8sClusterName, sourceRegion },
        'Missing source instance details — skipping non-principal user sync',
      );
      return;
    }

    let sourceUsers;
    try {
      sourceUsers = await userService.listUsers(
        sourceInstanceId,
        sourceCloudProvider,
        sourceK8sClusterName,
        sourceRegion,
      );
    } catch (error) {
      logger.warn(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'Could not list users from source instance — skipping non-principal user sync',
      );
      return;
    }

    // Filter out the principal user — already handled above with the correct password
    const usersToSync = sourceUsers.filter((u) => u.username !== falkordbUsername);

    logger.info({ count: usersToSync.length }, 'Non-principal users to sync from source instance');

    let syncedCount = 0;
    const syncErrors: Array<{ instanceId: string; error: string }> = [];

    for (const user of usersToSync) {
      // Passwords are write-only in LDAP — assign a random initial password.
      // Users must reset their passwords after restoration.
      const randomPassword = randomBytes(24).toString('base64url');

      try {
        await userService.createUser(instanceId, cloudProvider, k8sClusterName, region, {
          username: user.username,
          password: randomPassword,
          acl: user.acl,
        });
        syncedCount++;
        logger.info({ username: '***' }, 'Non-principal user synced to restored instance');
      } catch (error) {
        if (error instanceof Error && (error.message.includes('already exists') || error.message.includes('409'))) {
          // Already present — ACL may differ; update it but leave password unchanged
          try {
            await userService.modifyUser(instanceId, cloudProvider, k8sClusterName, region, user.username, {
              acl: user.acl,
            });
            syncedCount++;
            logger.info({ instanceId }, 'Non-principal user ACL updated in restored instance');
          } catch (modifyError) {
            const msg = modifyError instanceof Error ? modifyError.message : 'Unknown error';
            syncErrors.push({ instanceId, error: msg });
          }
        } else {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          syncErrors.push({ instanceId, error: msg });
        }
      }
    }

    if (syncErrors.length > 0) {
      logger.warn({ syncedCount, failedCount: syncErrors.length }, 'Some non-principal users failed to sync');
    } else {
      logger.info({ syncedCount }, 'Non-principal user sync completed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMessage }, 'Error processing instance restored job');
    throw new Error(`Failed to process instance restored: ${errorMessage}`);
  }
}
