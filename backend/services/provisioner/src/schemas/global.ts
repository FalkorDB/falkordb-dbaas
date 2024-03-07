import { type Static, Type } from '@sinclair/typebox';
import { SUPPORTED_CLOUD_PROVIDERS, SUPPORTED_REGIONS } from '../constants';

export const SupportedCloudProviderSchema = Type.Union(SUPPORTED_CLOUD_PROVIDERS.map((provider) => Type.Literal(provider)));

export type SupportedCloudProviderSchemaType = Static<typeof SupportedCloudProviderSchema>;

export const SupportedRegionsSchema = Type.Union(
  Object.values(SUPPORTED_REGIONS)
    .flat()
    .map((region) => Type.Literal(region)),
);

export type SupportedRegionsSchemaType = Static<typeof SupportedRegionsSchema>;
