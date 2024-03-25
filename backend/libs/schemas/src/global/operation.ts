import { type Static, Type } from '@sinclair/typebox';

export const OperationStatusSchema = Type.Union([
  Type.Literal('pending'),
  Type.Literal('in-progress'),
  Type.Literal('failed'),
  Type.Literal('completed'),
]);

export type OperationStatusSchemaType = Static<typeof OperationStatusSchema>;

export const OperationResourceTypeSchema = Type.Union([Type.Literal('tenant'), Type.Literal('tenant-group')]);

export type OperationResourceTypeSchemaType = Static<typeof OperationResourceTypeSchema>;

export const OperationProviderSchema = Type.Union([Type.Literal('cloudbuild')]);

export type OperationProviderSchemaType = Static<typeof OperationProviderSchema>;

export const OperationSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  status: OperationStatusSchema,
  type: Type.Union([Type.Literal('create'), Type.Literal('update'), Type.Literal('delete')]),
  resourceType: OperationResourceTypeSchema,
  resourceId: Type.String(),

  operationProvider: OperationProviderSchema,

  payload: Type.Optional(Type.Any()),
});

export type OperationSchemaType = Static<typeof OperationSchema>;

export const CreateOperationParamsSchema = Type.Object({
  id: Type.String(),
  type: Type.Union([Type.Literal('create'), Type.Literal('update'), Type.Literal('delete')]),
  resourceType: OperationResourceTypeSchema,
  resourceId: Type.String(),
  operationProvider: OperationProviderSchema,
  status: OperationStatusSchema,
  payload: Type.Optional(Type.Any()),
});

export type CreateOperationParamsSchemaType = Static<typeof CreateOperationParamsSchema>;
