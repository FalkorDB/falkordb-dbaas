import { config } from 'dotenv';
config({ path: process.env.NODE_ENV === 'production' ? './.env.prod' : undefined });
import { MailRepository } from './repositories/mail/MailRepository';
import { OmnistrateRepository } from './repositories/omnistrate/OmnistrateRepository';
import { VictoriaMetricsRepository } from './repositories/victoriametrics/VictoriaMetricsRepository';
import { OmnistrateInstanceSchemaType } from './schemas/OmnistrateInstance';
import pino from 'pino';
import { gcpLogOptions } from 'pino-cloud-logging';

const LAST_USED_TIME_THRESHOLD = parseInt(process.env.LAST_USED_TIME_THRESHOLD || '86400000', 10); // 24 hours

const logger = pino(gcpLogOptions());

async function handleFreeInstance(
  instance: OmnistrateInstanceSchemaType,
  omnistrateRepo: OmnistrateRepository,
  victoriaMetricsRepo: VictoriaMetricsRepository,
  mailRepo: MailRepository,
) {
  logger.info(`Handling free instance ${instance.id}`);
  try {
    const { id: instanceId } = instance;

    // Check if created date is older than LAST_USED_TIME_THRESHOLD before querying metrics
    const createdDate = new Date(instance.createdDate).getTime();
    if (Date.now() - createdDate <= LAST_USED_TIME_THRESHOLD) {
      logger.info(
        `Instance ${instance.id} is still within threshold. Created at: ${new Date(
          createdDate,
        ).toISOString()}. Skipping metrics check.`,
      );
      return;
    }

    // Get the number of graph.QUERY and graph.RO_QUERY commands executed in the last 24 hours from VictoriaMetrics
    const graphQueryCount = await victoriaMetricsRepo.getGraphQueryCount(instanceId);

    if (graphQueryCount === null) {
      logger.error(`Failed to get graph.query count for instance ${instanceId}. Skipping.`);
      return;
    }

    if (graphQueryCount === 0) {
      logger.info(
        `Instance ${instance.id} has 0 graph.query commands in the last 24h and is older than threshold, created at: ${new Date(
          createdDate,
        ).toISOString()}. Stopping it.`,
      );
      await stopInstance(instance, omnistrateRepo, mailRepo);
    } else {
      logger.info(`Instance ${instance.id} has ${graphQueryCount} graph.query commands in the last 24h. Not stopping.`);
    }
  } catch (error) {
    logger.error(error);
  }
}

async function stopInstance(
  instance: OmnistrateInstanceSchemaType,
  omnistrateRepo: OmnistrateRepository,
  mailRepo: MailRepository,
) {
  await omnistrateRepo.stopInstance(instance);
  const { email, name } = await omnistrateRepo.getUser(instance.userId);
  await mailRepo.sendInstanceStoppedEmail(email, name, instance.id);
}

export async function start() {
  const omnistrateRepo = new OmnistrateRepository(process.env.OMNISTRATE_USER, process.env.OMNISTRATE_PASSWORD, {
    logger,
  });
  const victoriaMetricsRepo = new VictoriaMetricsRepository(
    process.env.VICTORIAMETRICS_URL || 'http://vmsingle-vm.observability.svc.cluster.local:8429',
    process.env.VICTORIAMETRICS_USERNAME,
    process.env.VICTORIAMETRICS_PASSWORD,
    { logger },
  );
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
    await Promise.allSettled(instances.map((instance) => handleFreeInstance(instance, omnistrateRepo, victoriaMetricsRepo, mailRepo)));
  }

  logger.info('Done');
}

if (process.env.DRY_RUN === '1') {
  logger.info('DRY RUN');
}
start();
