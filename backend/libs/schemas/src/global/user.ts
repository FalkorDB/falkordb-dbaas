import { type Static, Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type UserSchemaType = Static<typeof UserSchema>;

export const UserCreateSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
});

export type UserCreateSchemaType = Static<typeof UserCreateSchema>;

export const UserUpdateSchema = Type.Object({
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
});

export type UserUpdateSchemaType = Static<typeof UserUpdateSchema>;
