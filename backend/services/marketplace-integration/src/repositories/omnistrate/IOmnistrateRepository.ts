export abstract class IOmnistrateRepository {
  static repositoryName: string = 'IOmnistrateRepository';

  abstract createServiceAccount(params: {
    marketplaceAccountId: string;
    companyName: string;
  }): Promise<void>;


  abstract createSubscription(params: { productTierId: string, marketplaceAccountId: string; entitlementId?: string }): Promise<{ subscriptionId: string }>;

  abstract inviteUserToSubscription(params: {
    marketplaceAccountId: string;
    subscriptionId: string;
    email: string;
    role: 'reader' | 'editor'
  }): Promise<void>;

  abstract createFreeDeployment(params: { marketplaceAccountId: string; }): Promise<{
    instanceId: string;
    username: string;
    password: string;
  }>;

  abstract deleteDeployments(params: { marketplaceAccountId: string }): Promise<void>;
}
