import { type Static, Type } from '@sinclair/typebox';

export const TenantGroupProvisionBodySchema = Type.Object({
  name: Type.String(),
});

export type TenantGroupProvisionBodySchemaType = Static<typeof TenantGroupProvisionBodySchema>;
