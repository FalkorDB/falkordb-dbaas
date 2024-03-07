import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema } from '../../../schemas/operation';

export const TenantRefreshParamsSchema = Type.Object({
  id: Type.String(),
});

export type TenantRefreshParamsSchemaType = Static<typeof TenantRefreshParamsSchema>;

export const TenantRefreshResponseSchema = CreateOperationParamsSchema;

export type TenantRefreshResponseSchemaType = Static<typeof TenantRefreshResponseSchema>;
