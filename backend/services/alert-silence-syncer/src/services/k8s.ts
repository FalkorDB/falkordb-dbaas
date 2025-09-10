import * as k8s from '@kubernetes/client-node';
import { ARGOCD_NAMESPACE, SILENCE_ID_LABEL, SILENCE_MANAGED_BY_LABEL } from '../constants';
import logger from '../logger';
import { Silence } from '../types';
import { generateArgoCDAppManifest } from './argocd';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
const coreApi = kc.makeApiClient(k8s.CoreV1Api);

export async function fetchSilenceApplications(): Promise<Silence[]> {
  logger.info('Fetching existing silence applications from ArgoCD...');

  try {
    const existingArgoApps = await k8sApi.listNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', undefined, undefined, undefined, undefined, SILENCE_MANAGED_BY_LABEL,
    ) as { body: any };
    const existingSilenceApps = existingArgoApps.body.items;

    const silences: Silence[] = existingSilenceApps.map((app: any) => {
      const silenceId = app.labels?.[SILENCE_ID_LABEL];
      if (!silenceId) {
        logger.warn({ app }, 'Found ArgoCD Application without silence ID label. Skipping.');
        return null;
      }
      return {
        id: silenceId,
      } as Silence;
    }).filter((s): s is Silence => s !== null);

    return silences;
  } catch (error) {
    logger.error(error, 'Failed to fetch silence applications from ArgoCD:');
    return [];
  }
}

export async function createApplicationIfNotExists(
  manifest: ReturnType<typeof generateArgoCDAppManifest>
) {
  logger.info(`Ensuring ArgoCD Application '${manifest.metadata.name}' exists...`);
  try {
    await k8sApi.getNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', manifest.metadata.name
    );
    logger.info(`ArgoCD Application '${manifest.metadata.name}' already exists. Skipping creation.`);
  } catch (err) {
    if (err.statusCode === 404) {
      logger.info(`Creating ArgoCD Application '${manifest.metadata.name}'...`);
      await k8sApi.createNamespacedCustomObject(
        'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', manifest
      );
      logger.info(`Successfully created ArgoCD Application: '${manifest.metadata.name}'`);
    } else {
      logger.error(err.response?.body || err, `Error checking for existing ArgoCD Application '${manifest.metadata.name}':`,);
    }
  }
}

export async function deleteApplication(appName: string) {
  logger.info(`Deleting ArgoCD Application '${appName}'...`);
  try {
    await k8sApi.deleteNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', appName
    );
    logger.info(`Successfully deleted ArgoCD Application: '${appName}'`);
  } catch (error) {
    logger.error(error, `Failed to delete ArgoCD Application '${appName}':`);
  }
}

export async function fetchClusterSecretServer(clusterName: string): Promise<string | null> {
  logger.info(`Fetching cluster secret for cluster ${clusterName}...`);

  try {
    const secret = await coreApi.listNamespacedSecret(ARGOCD_NAMESPACE, undefined, undefined, undefined, undefined, `argocd.argoproj.io/secret-type=cluster,cluster=${clusterName}`);
    const secretBody = secret.body.items[0];
    if (!secretBody) {
      logger.warn(`No secret found for cluster ${clusterName}`);
      return null;
    }
    const clusterServer = secretBody.data?.server ? Buffer.from(secretBody.data.server, 'base64').toString('utf-8') : null;
    if (!clusterServer) {
      logger.warn(`Secret for cluster ${clusterName} does not contain 'server' field`);
      return null;
    }
    return clusterServer;
  } catch (error) {
    logger.error(error, `Failed to fetch cluster secret for ${clusterName}:`);
    return null;
  }
}