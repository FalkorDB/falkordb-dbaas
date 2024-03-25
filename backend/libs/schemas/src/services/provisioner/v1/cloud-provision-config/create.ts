import { type Static, Type } from '@sinclair/typebox';
import { CloudProvisionGCPConfigSchema, CreateCloudProvisionConfigParamsSchema } from '../../../../global';

export const CloudProvisionConfigCreateBodySchema = CreateCloudProvisionConfigParamsSchema;

export type CloudProvisionConfigCreateBodySchemaType = Static<typeof CloudProvisionConfigCreateBodySchema>;

export const CloudProvisionConfigCreateResponseSuccessSchema = CloudProvisionGCPConfigSchema;

export type CloudProvisionConfigCreateResponseSuccessSchemaType = Static<
  typeof CloudProvisionConfigCreateResponseSuccessSchema
>;
