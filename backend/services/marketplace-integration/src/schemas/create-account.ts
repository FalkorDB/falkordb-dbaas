import { type Static, Type } from '@sinclair/typebox';

export const CreateAccountMessageSchema = Type.Object({
  marketplaceAccountId: Type.String(),
  userEmail: Type.String(),
  name: Type.String(),
  companyName: Type.String(),
});

export type CreateAccountMessageType = Static<typeof CreateAccountMessageSchema>;
