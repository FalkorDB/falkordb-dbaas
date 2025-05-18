import { type Static, Type } from '@sinclair/typebox';

export const SupportedCloudProviderSchema = Type.Union([Type.Literal('gcp'), Type.Literal('aws')]);

export type SupportedCloudProviderSchemaType = Static<typeof SupportedCloudProviderSchema>;
