import { config } from 'dotenv';
config({ path: process.env.NODE_ENV === 'production' ? './.env.prod' : undefined });
import { K8sRepository } from './repositories/k8s/K8sRepository';
import { MailRepository } from './repositories/mail/MailRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { OmnistrateInstanceSchemaType } from './schemas/OmnistrateInstance';
import pino from 'pino';

const LAST_USED_TIME_THRESHOLD = parseInt(process.env.LAST_USED_TIME_THRESHOLD || '86400000', 10); // 24 hours

const logger = pino();

async function handleFreeInstance(
  instance: OmnistrateInstanceSchemaType,
  omnistrateRepo: OmnistrateRepository,
  k8sRepo: K8sRepository,
  mailRepo: MailRepository,
) {
  logger.info(`Handling free instance ${instance.id}`);
  try {
    // 2. For each instance, get the last used time from k8s
    const { clusterId, region, id: instanceId } = instance;

    // 3. If the last used time is more than 24 hours, stop the instance in omnistrate, and send an email to the user
    const lastUsedTime = await k8sRepo.getFalkorDBLastQueryTime(clusterId, region, instanceId, instance.tls);

    if (Date.now() - lastUsedTime > LAST_USED_TIME_THRESHOLD) {
      logger.info(
        `Instance ${instance.id} is not in use, last used time: ${new Date(lastUsedTime).toISOString()}. Stopping it.`,
      );
      await omnistrateRepo.stopInstance(instance);
      const { email, name } = await omnistrateRepo.getUser(instance.userId);
      await mailRepo.sendInstanceStoppedEmail(email, name, instanceId);
    } else {
      logger.info(`Instance ${instance.id} is still in use. Last used time: ${new Date(lastUsedTime).toISOString()}`);
    }
  } catch (error) {
    logger.error(error);
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

  logger.info(`Found ${freeInstances.length} free instances`);

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
  if (temp.length > 0) grouped.push(temp);

  for await (const instances of grouped) {
    await Promise.all(instances.map((instance) => handleFreeInstance(instance, omnistrateRepo, k8sRepo, mailRepo)));
  }

  logger.info('Done');
}

if (process.env.DRY_RUN === '1') {
  logger.info('DRY RUN');
}
start();
