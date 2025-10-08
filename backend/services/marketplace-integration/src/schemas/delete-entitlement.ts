import { type Static, Type } from '@sinclair/typebox';

export const DeleteEntitlementMessageSchema = Type.Object({
  marketplaceAccountId: Type.String(),
  entitlementId: Type.String(),
  productTierId: Type.String(),
});

export type DeleteEntitlementMessageType = Static<typeof DeleteEntitlementMessageSchema>;
