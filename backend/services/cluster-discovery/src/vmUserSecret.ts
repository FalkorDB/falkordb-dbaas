import { getK8sConfig } from "./common/k8s";
import { VMUSER_SECRET_NAMESPACE, VMUSER_SOURCE_SECRET_NAME, VMUSER_TARGET_SECRET_NAME } from "./constants";
import logger from "./logger";
import { Cluster } from "./types";
import * as k8s from '@kubernetes/client-node';

/**
 * Creates a job that checks if the vmuser secret was already created in-cluster.
 * If so, it will copy the content and create a secret in the target cluster with the same content.
 * If the secret exists with different content, it will update the secret.
 *
 * @param cluster - The target cluster where the vmuser secret should be managed.
 * @returns A promise that resolves when the job is created.
 */
export const createOrUpdateTargetClusterVMUserSecretJob = async (cluster: Cluster) => {

  // Source cluster: where the secret is copied from
  const sourceKc = new k8s.KubeConfig();
  sourceKc.loadFromDefault();
  const sourceApi = sourceKc.makeApiClient(k8s.CoreV1Api);

  let sourceSecret: k8s.V1Secret | undefined;
  try {
    const resp = await sourceApi.readNamespacedSecret(VMUSER_SOURCE_SECRET_NAME(cluster.name), VMUSER_SECRET_NAMESPACE);
    sourceSecret = resp.body;
  } catch (err) {
    logger.warn(`Source vmuser secret not found in namespace ${VMUSER_SECRET_NAMESPACE}, skipping vmuser secret job creation for cluster ${cluster.name}`);
    return;
  }

  // Target cluster: where the secret is created/updated
  const targetKc = await getK8sConfig(cluster.cloud, cluster.name, cluster.region);
  const targetApi = targetKc.makeApiClient(k8s.CoreV1Api);

  try {
    const targetResp = await targetApi.readNamespacedSecret(VMUSER_TARGET_SECRET_NAME, VMUSER_SECRET_NAMESPACE);
    const targetSecret = targetResp.body;

    // Compare data
    if (JSON.stringify(targetSecret.data) !== JSON.stringify(sourceSecret.data)) {
      // Update secret
      const updatedSecret: k8s.V1Secret = {
        metadata: targetSecret.metadata,
        data: sourceSecret.data,
      };
      await targetApi.replaceNamespacedSecret(VMUSER_TARGET_SECRET_NAME, VMUSER_SECRET_NAMESPACE, updatedSecret);
      logger.info(`Updated vmuser secret in target cluster ${cluster.name}`);
    }
    // else: already up to date
  } catch (err: any) {
    if (err.statusCode === 404) {
      // Create secret
      const secretManifest: k8s.V1Secret = {
        metadata: {
          name: VMUSER_TARGET_SECRET_NAME,
          namespace: VMUSER_SECRET_NAMESPACE,
        },
        data: sourceSecret.data,
      };
      await targetApi.createNamespacedSecret(VMUSER_SECRET_NAMESPACE, secretManifest);
      logger.info(`Created vmuser secret in target cluster ${cluster.name}`);
    } else {
      logger.error(err, `Error managing vmuser secret in target cluster ${cluster.name}:`);
    }
  }
}