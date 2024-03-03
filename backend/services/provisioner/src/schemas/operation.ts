import { type Static, Type } from '@sinclair/typebox';

export const OperationStatusSchema = Type.Union([
  Type.Literal('pending'),
  Type.Literal('in-progress'),
  Type.Literal('failed'),
  Type.Literal('completed'),
]);

export const OperationProviderSchema = Type.Union([Type.Literal('cloudbuild')]);

export type OperationProviderSchemaType = Static<typeof OperationProviderSchema>;

export const OperationSchema = Type.Object({
  id: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),

  status: OperationStatusSchema,
  type: Type.Union([Type.Literal('create'), Type.Literal('update'), Type.Literal('delete')]),
  resourceType: Type.Union([Type.Literal('tenant'), Type.Literal('tenant-group')]),
  resourceId: Type.String(),

  operationProvider: OperationProviderSchema,
  operationProviderId: Type.String(),

  payload: Type.Optional(Type.Any()),
});

export type OperationSchemaType = Static<typeof OperationSchema>;

export const CreateOperationParamsSchema = Type.Object({
  type: Type.Union([Type.Literal('create'), Type.Literal('update'), Type.Literal('delete')]),
  resourceType: Type.Union([Type.Literal('tenant'), Type.Literal('tenant-group')]),
  resourceId: Type.String(),
  operationProvider: OperationProviderSchema,
  operationProviderId: Type.String(),
  status: OperationStatusSchema,
  payload: Type.Optional(Type.Any()),
});

export type CreateOperationParamsSchemaType = Static<typeof CreateOperationParamsSchema>;
