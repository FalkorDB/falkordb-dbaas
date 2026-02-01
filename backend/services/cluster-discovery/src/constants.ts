// Service metadata
export const SERVICE_NAME = 'cluster-discovery';
export const SERVICE_VERSION = '1.0.0';

// Kubernetes namespaces
export const ARGOCD_NAMESPACE = 'argocd';
export const OBSERVABILITY_NAMESPACE = 'observability';
export const SYSTEM_NAMESPACE = 'kube-system';

// Secret names and configurations
export const AWS_CREDENTIALS_SECRET_NAME = 'aws-profile';

export const PAGERDUTY_INTEGRATION_KEY_SECRET_NAME = 'pagerduty-service-key';
export const PAGERDUTY_INTEGRATION_KEY_SECRET_NAMESPACE = 'observability';
export const PAGERDUTY_INTEGRATION_KEY_SECRET_KEY = 'api-key';

export const VMUSER_SECRET_NAMESPACE = 'observability';
export const VMUSER_SOURCE_SECRET_NAME = (clusterId: string) => `${clusterId}-vmuser`;
export const VMUSER_TARGET_SECRET_NAME = 'vmuser';

// Cloud providers
export const CLOUD_PROVIDER = {
  GCP: 'gcp',
  AWS: 'aws',
  AZURE: 'azure',
} as const;

export type CloudProvider = (typeof CLOUD_PROVIDER)[keyof typeof CLOUD_PROVIDER];

// Host modes
export const HOST_MODE = {
  MANAGED: 'managed',
  BYOA: 'byoa',
} as const;

export type HostMode = (typeof HOST_MODE)[keyof typeof HOST_MODE];

// Cluster roles
export const CLUSTER_ROLE = {
  APP_PLANE: 'app-plane',
  CTRL_PLANE: 'ctrl-plane',
} as const;

export type ClusterRole = (typeof CLUSTER_ROLE)[keyof typeof CLUSTER_ROLE];

// Node pool names
export const NODE_POOL_NAME = {
  OBSERVABILITY: 'observability',
  DEFAULT: 'default',
} as const;

// AWS specific constants
export const AWS = {
  DEFAULT_ROLE_NAME: 'omnistrate-bootstrap-role',
  DEFAULT_INSTANCE_TYPE: 'm5.large',
  DEFAULT_DISK_SIZE_GB: 50,
  DEFAULT_MIN_NODES: 1,
  DEFAULT_MAX_NODES: 10,
  WEB_IDENTITY_TOKEN_FILE: '/var/run/secrets/eks.amazonaws.com/serviceaccount/token',
} as const;

// GCP specific constants
export const GCP = {
  DEFAULT_MACHINE_TYPE: 'e2-standard-2',
  DEFAULT_DISK_SIZE_GB: 50,
  DEFAULT_MIN_NODES: 1,
  DEFAULT_MAX_NODES: 10,
  DEFAULT_MAX_PODS_PER_NODE: 25,
  WORKLOAD_IDENTITY_POOL_PATH:
    'projects/{projectNumber}/locations/global/workloadIdentityPools/omnistrate-bootstrap-id-pool/providers/omnistrate-oidc-prov',
  SERVICE_ACCOUNT_TEMPLATE: 'bootstrap-{orgId}@{projectNumber}.iam.gserviceaccount.com',
} as const;

// Labels
export const LABEL = {
  CLUSTER: 'cluster',
  CLOUD: 'cloud',
  REGION: 'region',
  ROLE: 'role',
  HOST_MODE: 'hostMode',
  NODE_POOL: 'node_pool',
} as const;

// Retry configuration
export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// Timeouts
export const TIMEOUT = {
  DEFAULT_REQUEST_MS: 30000,
  K8S_EXEC_MS: 5000,
  DISCOVERY_MS: 60000,
} as const;

// Scanner configuration
export const SCANNER = {
  DEFAULT_INTERVAL_MS: 120000, // 2 minutes
  MIN_INTERVAL_MS: 30000, // 30 seconds
  MAX_INTERVAL_MS: 3600000, // 1 hour
} as const;
 
