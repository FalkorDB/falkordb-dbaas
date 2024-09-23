export abstract class IOmnistrateRepository {
  static repositoryName: string = 'IOmnistrateRepository';

  abstract createReadOnlySubscription(params: { marketplaceAccountId: string; userEmail: string }): Promise<void>;

  abstract createFreeDeployment(params: { marketplaceAccountId: string; entitlementId: string }): Promise<{
    instanceId: string;
    username: string;
    password: string;
  }>;

  abstract deleteDeployment(params: { marketplaceAccountId: string; entitlementId: string }): Promise<void>;
}
