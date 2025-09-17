import { getK8sConfig } from "./common/k8s";
import { PAGERDUTY_INTEGRATION_KEY_SECRET_KEY, PAGERDUTY_INTEGRATION_KEY_SECRET_NAME, PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE } from "./constants";
import logger from "./logger";
import { Cluster } from "./types";
import * as k8s from '@kubernetes/client-node';

export const createTargetClusterPagerDutySecret = async (cluster: Cluster) => {
  if (!process.env.PAGERDUTY_INTEGRATION_KEY) {
    logger.warn('PAGERDUTY_INTEGRATION_KEY is not set, skipping PagerDuty secret creation');
    return;
  }

  const secretData = {
    [PAGERDUTY_INTEGRATION_KEY_SECRET_KEY]: Buffer.from(process.env.PAGERDUTY_INTEGRATION_KEY).toString('base64'),
  };

  const kc = await getK8sConfig(
    cluster.cloud,
    cluster.name,
    cluster.region
  )

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  try {
    const secret = await k8sApi.readNamespacedSecret(PAGERDUTY_INTEGRATION_KEY_SECRET_NAME, PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE);
    logger.info(`PagerDuty secret already exists in cluster ${cluster.name}`);

    if (secret.body.data?.[PAGERDUTY_INTEGRATION_KEY_SECRET_KEY] !== Buffer.from(process.env.PAGERDUTY_INTEGRATION_KEY).toString('base64')) {
      logger.info(`Updating existing PagerDuty secret in cluster ${cluster.name}...`);
      const updatedSecret: k8s.V1Secret = {
        metadata: secret.body.metadata,
        stringData: {
          ...secret.body.data,
          ...secretData,
        },
      };
      try {
        await k8sApi.replaceNamespacedSecret(PAGERDUTY_INTEGRATION_KEY_SECRET_NAME, PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE, updatedSecret);
        logger.info(`Successfully updated PagerDuty secret in cluster ${cluster.name}`);
      } catch (updateErr) {
        logger.error(updateErr, `Error updating PagerDuty secret in cluster ${cluster.name}:`);
      }
    }
  } catch (err) {
    if (err.statusCode === 404) {
      logger.info(`Creating PagerDuty secret in cluster ${cluster.name}...`);
      const secretManifest: k8s.V1Secret = {
        metadata: {
          name: PAGERDUTY_INTEGRATION_KEY_SECRET_NAME,
          namespace: PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE,
        },
        stringData: secretData,
      };
      try {
        await k8sApi.createNamespacedSecret(PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE, secretManifest);
        logger.info(`Successfully created PagerDuty secret in cluster ${cluster.name}`);
      } catch (createErr) {
        logger.error(createErr, `Error creating PagerDuty secret in cluster ${cluster.name}:`);
      }
    } else {
      logger.error(err.response?.body || err, `Error checking for existing PagerDuty secret in cluster ${cluster.name}:`);
    }
  }

}
