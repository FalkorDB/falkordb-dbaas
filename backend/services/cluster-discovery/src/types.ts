import * as yup from 'yup';

// Schema for a Kubernetes cluster
export const ClusterSchema = yup.object({
  name: yup.string().required(),
  endpoint: yup.string().required(),
  labels: yup.object().shape({}).default({}),
  cloud: yup.string().oneOf(['gcp', 'aws', 'azure']).required(),
  region: yup.string().required(),
  secretConfig: yup.object().optional(),
  hostMode: yup.string().oneOf(['managed', 'byoa']).required(),
  azureResourceGroupName: yup.string().optional(),
  azureClientId: yup.string().optional(),
  azureTenantId: yup.string().optional(),
  azureSubscriptionId: yup.string().optional(),
  gcpServiceAccountEmail: yup.string().optional(),
  gcpAccountNumber: yup.string().optional(),
  gcpAccountID: yup.string().optional(),
  awsAccountID: yup.string().optional(),
  awsRoleARN: yup.string().optional(),
  createdAt: yup.date().optional(),
});

// TypeScript type inferred from the schema
export type Cluster = yup.InferType<typeof ClusterSchema>;
