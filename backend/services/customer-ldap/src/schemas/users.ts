import { Type, Static } from '@sinclair/typebox';

// Common schemas
export const LdapUserSchema = Type.Object({
  username: Type.String(),
  acl: Type.String(),
});

export type LdapUserSchemaType = Static<typeof LdapUserSchema>;

// List Users
export const ListUsersResponseSchema = Type.Object({
  users: Type.Array(LdapUserSchema),
});

export type ListUsersResponseSchemaType = Static<typeof ListUsersResponseSchema>;

// Create User
export const CreateUserRequestSchema = Type.Object({
  username: Type.String({ minLength: 3 }),
  password: Type.String({ minLength: 6 }),
  acl: Type.String({ minLength: 1 }),
});

export type CreateUserRequestSchemaType = Static<typeof CreateUserRequestSchema>;

export const CreateUserResponseSchema = Type.Object({
  message: Type.String(),
});

export type CreateUserResponseSchemaType = Static<typeof CreateUserResponseSchema>;

// Modify User
export const ModifyUserRequestSchema = Type.Object({
  password: Type.Optional(Type.String({ minLength: 6 })),
  acl: Type.Optional(Type.String({ minLength: 1 })),
});

export type ModifyUserRequestSchemaType = Static<typeof ModifyUserRequestSchema>;

export const ModifyUserResponseSchema = Type.Object({
  message: Type.String(),
});

export type ModifyUserResponseSchemaType = Static<typeof ModifyUserResponseSchema>;

// Delete User
export const DeleteUserResponseSchema = Type.Object({
  message: Type.String(),
});

export type DeleteUserResponseSchemaType = Static<typeof DeleteUserResponseSchema>;

// Route params
export const InstanceIdParamSchema = Type.Object({
  instanceId: Type.String(),
});

export type InstanceIdParamSchemaType = Static<typeof InstanceIdParamSchema>;

export const UsernameParamSchema = Type.Object({
  instanceId: Type.String(),
  username: Type.String(),
});

export type UsernameParamSchemaType = Static<typeof UsernameParamSchema>;

// Query params
export const SubscriptionIdQuerySchema = Type.Object({
  subscriptionId: Type.String(),
});

export type SubscriptionIdQuerySchemaType = Static<typeof SubscriptionIdQuerySchema>;
