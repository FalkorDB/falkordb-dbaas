
export const ARGOCD_NAMESPACE = 'argocd';

export const ARGO_SILENCE_REPO_URL = process.env.ARGO_SILENCE_REPO_URL || "https://github.com/FalkorDB/falkordb-dbaas.git";
export const ARGO_SILENCE_REPO_PATH = process.env.ARGO_SILENCE_REPO_PATH || "argocd/kustomize/alert-silence";

export const SILENCE_NAMESPACE = 'observability';
export const SILENCE_MANAGED_BY_LABEL = 'app.kubernetes.io/managed-by=silence-syncer';

export const ALERTMANAGER_URL = process.env.ALERTMANAGER_URL || 'http://vmalertmanager-vm.observability.svc.cluster.local:9093';

export const SILENCE_APP_NAME = (silenceId: string) => `am-silence-${silenceId.substring(0, 10).toLowerCase()}`;
export const SILENCE_ID_FROM_APP_NAME = (appName: string) => appName.replace(/^am-silence-/, '');