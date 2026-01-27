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
  destinationAccountID: yup.string().optional(),
  destinationAccountNumber: yup.string().optional(),
  organizationId: yup.string().optional(),
});

// TypeScript type inferred from the schema
export type Cluster = yup.InferType<typeof ClusterSchema>;
