import {
  CloudProvisionConfigSchemaType,
  CreateCloudProvisionConfigParamsSchemaType,
} from '../../schemas/cloudProvision';
import { SupportedCloudProviderSchemaType } from '../../schemas/global';

export abstract class ICloudProvisionConfigsRepository {
  create(params: CreateCloudProvisionConfigParamsSchemaType): Promise<CloudProvisionConfigSchemaType> {
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  query(params: {
    cloudProvider?: SupportedCloudProviderSchemaType;
    deploymentConfigVersion?: number;
  }): Promise<CloudProvisionConfigSchemaType[]> {
    throw new Error('Not implemented');
  }
}
