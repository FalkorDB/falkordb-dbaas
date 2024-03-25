import { type Static, Type } from '@sinclair/typebox';
import { CreateOperationParamsSchema } from '../../../../global';

export const TenantRefreshParamsSchema = Type.Object({
  id: Type.String(),
});

export type TenantRefreshParamsSchemaType = Static<typeof TenantRefreshParamsSchema>;

export const TenantRefreshResponseSchema = CreateOperationParamsSchema;

export type TenantRefreshResponseSchemaType = Static<typeof TenantRefreshResponseSchema>;
