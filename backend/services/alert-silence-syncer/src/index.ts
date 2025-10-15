import { SILENCE_APP_NAME } from './constants';
import logger from './logger';
import { fetchActiveSilences } from './services/alertmanager';
import { generateArgoCDAppManifest, generateArgoCDAppSetManifest } from './services/argocd';
import { createApplicationIfNotExists, deleteApplication, fetchClusterSecretServer, fetchSilenceApplications } from './services/k8s';
import { AlertmanagerSilence, Silence } from './types';

function alertmanagerSilenceToSilence(silence: AlertmanagerSilence): Silence {
  return {
    id: silence.id,
    matchers: silence.matchers.map(m => ({
      name: m.name,
      value: m.value,
      matchType: m.isRegex ?
        m.isEqual ? '=~' : '!~'
        : m.isEqual ? '=' : '!=',
    })),
  };
}

async function main() {

  try {
    const activeSilences = await fetchActiveSilences();
    const activeSilenceIds = new Set(activeSilences.map(s => s.id));

    // Get the list of existing ArgoCD Application resources managed by this service
    const existingArgoApps = await fetchSilenceApplications();
    if (!activeSilences.length) {
      logger.info('No active silences found in Alertmanager.');
    }


    // Create or update ArgoCD Applications for new/active silences
    for (const silence of activeSilences) {
      const clusterMatcher = silence.matchers.find(m => m.name === 'cluster');
      if (!clusterMatcher && silence.comment?.includes('[all-clusters]')) {
        logger.info({ silence }, 'Silence applies to all clusters. Creating ArgoCD Applications for all registered clusters.');
        const appSetManifest = generateArgoCDAppSetManifest(alertmanagerSilenceToSilence(silence));

        await createApplicationIfNotExists('applicationsets', appSetManifest);
        continue;
      }
      const clusterServer = await fetchClusterSecretServer(clusterMatcher.value);

      if (!clusterServer) {
        logger.info({ silence, cluster: clusterMatcher.value, clusterServer }, `No ArgoCD cluster secret found for cluster ${clusterMatcher.value}. Skipping silence ID ${silence.id}.`);
        continue;
      }

      const appManifest = generateArgoCDAppManifest(alertmanagerSilenceToSilence(silence), {
        name: clusterMatcher.value,
        server: clusterServer,
      });


      await createApplicationIfNotExists('applications', appManifest);
    }

    if (!existingArgoApps.length) {
      logger.info('No existing silence applications found in ArgoCD.');
    }
    // Delete ArgoCD Applications for expired silences
    for (const app of existingArgoApps) {
      const silenceId = app.id;
      if (!activeSilenceIds.has(silenceId)) {
        await deleteApplication(SILENCE_APP_NAME(silenceId));
      }
    }

  } catch (error) {
    logger.error(error, 'An error occurred during ArgoCD synchronization:');
  }
}

main().catch((err) => {
  logger.error('Error during alert-silence-syncer:', err);
  process.exit(1);
});
