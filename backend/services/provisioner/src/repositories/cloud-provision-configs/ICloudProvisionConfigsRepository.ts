import {
  CloudProvisionConfigSchemaType,
  CreateCloudProvisionConfigParamsSchemaType,
} from '../../schemas/cloudProvision';
import { SupportedCloudProviderSchemaType } from '../../schemas/global';

export abstract class ICloudProvisionConfigsRepository {
  static repositoryName = 'CloudProvisionConfigsRepository';

  create(params: CreateCloudProvisionConfigParamsSchemaType): Promise<CloudProvisionConfigSchemaType> {
    throw new Error('Not implemented');
  }

  delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  query(params: {
    cloudProvider?: SupportedCloudProviderSchemaType;
    deploymentConfigVersion?: number;
    page?: number;
    pageSize?: number;
  }): Promise<CloudProvisionConfigSchemaType[]> {
    throw new Error('Not implemented');
  }

  get(id: string): Promise<CloudProvisionConfigSchemaType> {
    throw new Error('Not implemented');
  }
}
