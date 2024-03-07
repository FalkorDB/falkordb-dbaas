import {
  CloudProvisionConfigSchemaType,
  CreateCloudProvisionConfigParamsSchemaType,
} from '../../schemas/cloudProvision';
import { SupportedCloudProviderSchemaType } from '../../schemas/global';

export abstract class ICloudProvisionConfigsRepository {
  static repositoryName = 'CloudProvisionConfigsRepository';

  abstract create(params: CreateCloudProvisionConfigParamsSchemaType): Promise<CloudProvisionConfigSchemaType>;

  abstract delete(id: string): Promise<void>;

  abstract query(params: {
    cloudProvider?: SupportedCloudProviderSchemaType;
    deploymentConfigVersion?: number;
    page?: number;
    pageSize?: number;
  });

  abstract get(id: string): Promise<CloudProvisionConfigSchemaType>;
}
