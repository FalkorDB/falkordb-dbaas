import { type Static, Type } from '@sinclair/typebox';

export const OrganizationSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  name: Type.String(),
  creatorUserId: Type.String(),
});

export type OrganizationType = Static<typeof OrganizationSchema>;

export const CreateOrganizationSchema = Type.Object({
  name: Type.String(),
  creatorUserId: Type.String(),
});

export type CreateOrganizationType = Static<typeof CreateOrganizationSchema>;

export const UpdateOrganizationSchema = Type.Object({
  name: Type.String(),
});

export type UpdateOrganizationType = Static<typeof UpdateOrganizationSchema>;
