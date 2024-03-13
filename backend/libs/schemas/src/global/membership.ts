import { type Static, Type } from '@sinclair/typebox';

export const UserMembershipItem = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  userId: Type.String(),
  organizationId: Type.String(),
  role: Type.String(),
});

export type UserMembershipItemType = Static<typeof UserMembershipItem>;
