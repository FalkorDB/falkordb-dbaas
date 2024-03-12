import { type Static, Type } from '@sinclair/typebox';
import { SupportedCloudProviderSchema } from './cloudProviders';

export const SupportedGCPRegionsSchema = Type.Union([Type.Literal('me-west1')]);

export type SupportedGCPRegionsSchemaType = Static<typeof SupportedGCPRegionsSchema>;

export const SupportedRegionsSchema = Type.Union([SupportedGCPRegionsSchema]);

export type SupportedRegionsSchemaType = Static<typeof SupportedRegionsSchema>;
