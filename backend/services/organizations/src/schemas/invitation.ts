import { type Static, Type } from '@sinclair/typebox';
import { RoleSchema } from './roles';

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
  role: RoleSchema,

  status: InvitationStatus,

  inviterId: Type.String(),
  inviterName: Type.String(),
});

export type InvitationSchemaType = Static<typeof InvitationSchema>;

export const CreateInvitationSchema = Type.Object({
  email: Type.String(),
  organizationId: Type.String(),
  role: RoleSchema,
});

export type CreateInvitationType = Static<typeof CreateInvitationSchema>;

export const UpdateInvitationSchema = Type.Object({
  status: InvitationStatus,
});
