import { type Static, Type } from '@sinclair/typebox';

enum CloudProviders {
  GCP = 'gcp',
  AWS = 'aws',
}

export const OmnistrateInstanceSchema = Type.Object({
  id: Type.String(),
  clusterId: Type.String(),
  region: Type.String(),
  userId: Type.String(),
  createdDate: Type.String(),
  serviceId: Type.String(),
  environmentId: Type.String(),
  tls: Type.Boolean(),
  resourceId: Type.String(),
  // enum: gcp or aws
  cloudProvider: Type.Enum(CloudProviders),
});

export type OmnistrateInstanceSchemaType = Static<typeof OmnistrateInstanceSchema>;
