export const SUPPORTED_CLOUD_PROVIDERS = ['gcp'] as const;

export type SupportedCloudProviders = (typeof SUPPORTED_CLOUD_PROVIDERS)[number];

export const SUPPORTED_REGIONS: {
  [key in SupportedCloudProviders]: string[];
} = {
  gcp: ['us-west1', 'us-east1', 'europe-west1', 'me-west1', 'asia-south1'],
};
