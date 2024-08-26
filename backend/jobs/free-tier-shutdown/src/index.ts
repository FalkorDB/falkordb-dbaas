import { K8sRepository } from './repositories/k8s/K8sRepository';
import { MailRepository } from './repositories/mail/MailRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { FalkorDBInfoObjectSchemaType } from './schemas/FalkorDBInfoObject';
import { OmnistrateInstanceSchemaType } from './schemas/OmnistrateInstance';
import pino from 'pino';

const logger = pino();

function getLastUsedTime(instanceInfo: FalkorDBInfoObjectSchemaType): number {
  if (instanceInfo.rdb_bgsave_in_progress) return Date.now();

  if (instanceInfo.rdb_saves === 0) {
    if (instanceInfo.rdb_changes_since_last_save === 0) {
      return instanceInfo.rdb_last_save_time * 1000;
    }

    return Date.now();
  }

  return instanceInfo.rdb_last_save_time * 1000;
}

async function handleFreeInstance(
  instance: OmnistrateInstanceSchemaType,
  omnistrateRepo: OmnistrateRepository,
  k8sRepo: K8sRepository,
  mailRepo: MailRepository,
) {
  try {
    // 2. For each instance, get the last used time from k8s
    const { clusterId, region, id: instanceId } = instance;
    const instanceInfo = await k8sRepo.getFalkorDBInfo(clusterId, region, instanceId, instance.tls);

    // 3. If the last used time is more than 24 hours, stop the instance in omnistrate, and send an email to the user
    const lastUsedTime = getLastUsedTime(instanceInfo);

    if (Date.now() - lastUsedTime > 24 * 60 * 60 * 1000) {
      await omnistrateRepo.stopInstance(instance);
      const userEmail = await omnistrateRepo.getUserEmail(instance.userId);
      await mailRepo.sendInstanceStoppedEmail(userEmail, instanceId);
    }
  } catch (error) {
    logger.error('Error handling free instance', error);
  }
}

export async function start() {
  const omnistrateRepo = new OmnistrateRepository(process.env.OMNISTRATE_USER, process.env.OMNISTRATE_PASSWORD, {
    logger,
  });
  const k8sRepo = new K8sRepository({ logger });
  const mailRepo = new MailRepository({ logger });

  // !. Get all free instances from omnistrate
  const freeInstances = await omnistrateRepo.getInstancesFromTier(
    process.env.OMNISTRATE_SERVICE_ID,
    process.env.OMNISTRATE_ENVIRONMENT_ID,
    process.env.OMNISTRATE_PRODUCT_TIER_ID,
  );

  // Group in arrays of 10
  const grouped: OmnistrateInstanceSchemaType[][] = [];
  let temp = [];
  for (let i = 0; i < freeInstances.length; i++) {
    temp.push(freeInstances[i]);
    if (temp.length === 10) {
      grouped.push(temp);
      temp = [];
    }
  }

  for await (const instances of grouped) {
    await Promise.all(instances.map((instance) => handleFreeInstance(instance, omnistrateRepo, k8sRepo, mailRepo)));
  }
}

start();
