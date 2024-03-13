import { type Static, Type } from '@sinclair/typebox';

export const CloudProvisionConfigDeleteParamsSchema = Type.Object({
  id: Type.String(),
});

export type CloudProvisionConfigDeleteParamsSchemaType = Static<typeof CloudProvisionConfigDeleteParamsSchema>;
