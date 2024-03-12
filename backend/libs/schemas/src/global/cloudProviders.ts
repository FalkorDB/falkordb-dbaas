import { type Static, Type } from '@sinclair/typebox';

export const SupportedCloudProviderSchema = Type.Union([Type.Literal('gcp')]);

export type SupportedCloudProviderSchemaType = Static<typeof SupportedCloudProviderSchema>;
