import * as k8s from '@kubernetes/client-node';
import { ARGOCD_NAMESPACE, SILENCE_ID_LABEL, SILENCE_MANAGED_BY_LABEL } from '../constants';
import logger from '../logger';
import { Silence } from '../types';
import { generateArgoCDAppManifest, generateArgoCDAppSetManifest } from './argocd';

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sApi = kc.makeApiClient(k8s.CustomObjectsApi);
const coreApi = kc.makeApiClient(k8s.CoreV1Api);

export async function fetchSilenceApplications(): Promise<Silence[]> {
  logger.info('Fetching existing silence applications from ArgoCD...');

  try {
    const [existingArgoApps, existingArgoAppSets] = await Promise.all([k8sApi.listNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', undefined, undefined, undefined, undefined, SILENCE_MANAGED_BY_LABEL,
    ), k8sApi.listNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applicationsets', undefined, undefined, undefined, undefined, SILENCE_MANAGED_BY_LABEL,
    )]) as [{ body: any }, { body: any }];
    const existingSilenceApps = [...existingArgoApps.body.items, ...existingArgoAppSets.body.items];

    const silences: Silence[] = existingSilenceApps.map((app: any) => {
      const silenceId = app.metadata?.labels?.[SILENCE_ID_LABEL];
      if (!silenceId) {
        logger.warn({ app }, 'Found ArgoCD Application/ApplicationSet without silence ID label. Skipping.');
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
  type: 'applications' | 'applicationsets',
  manifest: ReturnType<typeof generateArgoCDAppManifest> | ReturnType<typeof generateArgoCDAppSetManifest>
) {
  logger.info(`Ensuring ArgoCD ${type} '${manifest.metadata.name}' exists...`);
  try {
    await k8sApi.getNamespacedCustomObject(
      'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, type, manifest.metadata.name
    );
    logger.info(`ArgoCD ${type} '${manifest.metadata.name}' already exists. Skipping creation.`);
  } catch (err) {
    if (err.statusCode === 404) {
      logger.info(`Creating ArgoCD ${type} '${manifest.metadata.name}'...`);
      await k8sApi.createNamespacedCustomObject(
        'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, type, manifest
      );
      logger.info(`Successfully created ArgoCD ${type}: '${manifest.metadata.name}'`);
    } else {
      logger.error(err.response?.body || err, `Error checking for existing ArgoCD ${type} '${manifest.metadata.name}':`);
    }
  }
}

export async function deleteApplication(appName: string) {
  logger.info(`Deleting ArgoCD Application/ApplicationSet '${appName}'...`);
  try {
    await Promise.allSettled([
      k8sApi.deleteNamespacedCustomObject(
        'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applications', appName
      ),
      k8sApi.deleteNamespacedCustomObject(
        'argoproj.io', 'v1alpha1', ARGOCD_NAMESPACE, 'applicationsets', appName
      ),
    ]);
    logger.info(`Successfully deleted ArgoCD Application/ApplicationSet: '${appName}'`);
  } catch (error) {
    logger.error(error, `Failed to delete ArgoCD Application/ApplicationSet '${appName}':`);
  }
}

export async function fetchClusterSecretServer(clusterName: string): Promise<string | null> {
  logger.info(`Fetching cluster secret for cluster ${clusterName}...`);

  try {
    const secret = await coreApi.listNamespacedSecret(ARGOCD_NAMESPACE, undefined, undefined, undefined, undefined, `argocd.argoproj.io/secret-type=cluster,cluster=${clusterName}`);
    if (!secret.body.items || secret.body.items.length === 0) {
      logger.warn(`No secret found for cluster ${clusterName}`);
      return null;
    }
    const secretBody = secret.body.items[0];
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