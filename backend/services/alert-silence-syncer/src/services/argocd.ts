import { ARGO_SILENCE_REPO_PATH, ARGO_SILENCE_REPO_TARGET_REVISION, ARGO_SILENCE_REPO_URL, ARGOCD_NAMESPACE, SILENCE_APP_NAME, SILENCE_ID_LABEL, SILENCE_MANAGED_BY_LABEL, SILENCE_NAMESPACE } from "../constants";
import { Silence, Cluster } from "../types";
import logger from '../logger';

export function generateArgoCDAppManifest(
  silence: Silence, cluster: Cluster
) {
  logger.info(`Generating ArgoCD Application manifest for silence ${silence.id} in cluster ${cluster.name}`);

  // Use the Alertmanager silence ID to generate a unique ArgoCD Application name
  const appName = SILENCE_APP_NAME(silence.id);

  // Kustomize patches to set the Silence CRD spec dynamically
  // We assume the Kustomize base in the git repo has a template to be patched.
  const patches = [{
    target: {
      kind: 'Silence',
    },
    patch: `
- op: replace
  path: /metadata/name
  value: ${silence.id}
- op: replace
  path: /metadata/namespace
  value: ${SILENCE_NAMESPACE}
- op: replace
  path: /spec/matchers
  value: ${JSON.stringify(silence.matchers)}
`,
    patchType: 'json',
  }];

  return {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Application',
    metadata: {
      name: appName,
      namespace: ARGOCD_NAMESPACE,
      labels: {
        [SILENCE_MANAGED_BY_LABEL.split('=')[0]]: SILENCE_MANAGED_BY_LABEL.split('=')[1],
        [SILENCE_ID_LABEL]: silence.id,
        'app.kubernetes.io/part-of': 'alerting',
      },
      annotations: {
        // Pass the ArgoCD sync policy directly
        'argocd.argoproj.io/sync-wave': '1',
      },
      finalizers: ['resources-finalizer.argocd.argoproj.io'],
    },
    spec: {
      project: 'default',
      source: {
        repoURL: ARGO_SILENCE_REPO_URL,
        targetRevision: ARGO_SILENCE_REPO_TARGET_REVISION,
        path: ARGO_SILENCE_REPO_PATH,
        kustomize: {
          patches: patches,
        },
      },
      destination: {
        server: cluster.server,
        namespace: SILENCE_NAMESPACE,
      },
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true,
        },
        syncOptions: [
          'CreateNamespace=true',
        ],
      },
    },
  };
}


export function generateArgoCDAppSetManifest(
  silence: Silence,
) {

  logger.info(`Generating ArgoCD Application Set manifest for silence ${silence.id}`);

  // Use the Alertmanager silence ID to generate a unique ArgoCD Application name
  const appName = SILENCE_APP_NAME(silence.id);

  // Kustomize patches to set the Silence CRD spec dynamically
  // We assume the Kustomize base in the git repo has a template to be patched.
  const patches = [{
    target: {
      kind: 'Silence',
    },
    patch: `
- op: replace
  path: /metadata/name
  value: ${silence.id}
- op: replace
  path: /metadata/namespace
  value: ${SILENCE_NAMESPACE}
- op: replace
  path: /spec/matchers
  value: ${JSON.stringify(silence.matchers)}
`,
    patchType: 'json',
  }];

  return {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'ApplicationSet',
    metadata: {
      name: appName,
      namespace: ARGOCD_NAMESPACE,
      labels: {
        [SILENCE_MANAGED_BY_LABEL.split('=')[0]]: SILENCE_MANAGED_BY_LABEL.split('=')[1],
        [SILENCE_ID_LABEL]: silence.id,
        'app.kubernetes.io/part-of': 'alerting',
      },
      annotations: {
        // Pass the ArgoCD sync policy directly
        'argocd.argoproj.io/sync-wave': '1',
      },
      finalizers: ['resources-finalizer.argocd.argoproj.io'],
    },
    spec: {
      goTemplate: true,
      goTemplateOptions: ['missingkey=error'],
      generators: [
        {
          clusters: {
            selector: {
              matchLabels: {
                'role': 'app-plane',
              },
            },
          },
        }
      ],
      template: {
        metadata: {
          name: '{{ regexFind "h?c-[A-Za-z0-9]+" .name }}-' + appName,
        },
        spec: {
          project: 'default',
          source: {
            repoURL: ARGO_SILENCE_REPO_URL,
            targetRevision: ARGO_SILENCE_REPO_TARGET_REVISION,
            path: ARGO_SILENCE_REPO_PATH,
            kustomize: {
              patches: patches,
            },
          },
          destination: {
            server: '{{.server}}',
            namespace: SILENCE_NAMESPACE,
          },
          syncPolicy: {
            automated: {
              prune: true,
              selfHeal: true,
            },
            syncOptions: [
              'CreateNamespace=true',
            ],
          },
        }
      },
    },
  };
}