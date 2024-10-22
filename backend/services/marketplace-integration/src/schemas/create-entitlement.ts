import { type Static, Type } from '@sinclair/typebox';

export const CreateEntitlementMessageSchema = Type.Object({
  marketplaceAccountId: Type.String(),
  entitlementId: Type.String(),
  productTierId: Type.String(),
  userEmail: Type.String(),
});

export type CreateEntitlementMessageType = Static<typeof CreateEntitlementMessageSchema>;
