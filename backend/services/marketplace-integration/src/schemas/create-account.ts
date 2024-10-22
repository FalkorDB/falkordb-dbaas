import { type Static, Type } from '@sinclair/typebox';

export const CreateAccountMessageSchema = Type.Object({
  marketplaceAccountId: Type.String(),
  userEmail: Type.String(),
});

export type CreateAccountMessageType = Static<typeof CreateAccountMessageSchema>;
