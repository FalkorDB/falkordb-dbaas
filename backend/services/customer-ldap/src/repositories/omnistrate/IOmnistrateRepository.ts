/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IOmnistrateRepository {
  validate(token: string): Promise<boolean>;
  getInstance(instanceId: string): Promise<OmnistrateInstance>;
  getSubscriptionUsers(subscriptionId: string): Promise<SubscriptionUser[]>;
  checkIfUserHasAccessToInstance(
    userId: string,
    instanceId: string,
    minRole?: 'root' | 'writer' | 'reader'
  ): Promise<{ hasAccess: boolean; role?: 'root' | 'writer' | 'reader' }>;
}

export interface OmnistrateInstance {
  id: string;
  clusterId: string;
  region: string;
  userId: string;
  createdDate: string;
  serviceId: string;
  environmentId: string;
  productTierId: string;
  status: string;
  resourceId: string;
  cloudProvider: 'gcp' | 'aws' | 'azure';
  productTierName: string;
  deploymentType: string;
  subscriptionId: string;
  resultParams?: Record<string, string>;
}

export interface SubscriptionUser {
  userId: string;
  email: string;
  role: 'root' | 'writer' | 'reader';
}

export const IOmnistrateRepository = {
  repositoryName: 'IOmnistrateRepository',
};
