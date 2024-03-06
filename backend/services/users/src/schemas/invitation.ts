import { type Static, Type } from '@sinclair/typebox';

export const InvitationStatus = Type.Union([
  Type.Literal('pending'),
  Type.Literal('accepted'),
  Type.Literal('declined'),
  Type.Literal('expired'),
]);

export type InvitationStatusType = Static<typeof InvitationStatus>;

export const InvitationSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  email: Type.String(),
  userId: Type.Optional(Type.String()),

  organizationId: Type.String(),
  role: Type.String(),

  status: InvitationStatus,

  inviterId: Type.String(),
  inviterName: Type.String(),
});

export type InvitationSchemaType = Static<typeof InvitationSchema>;