import { type Static, Type } from '@sinclair/typebox';

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
});

export type OmnistrateInstanceSchemaType = Static<typeof OmnistrateInstanceSchema>;
