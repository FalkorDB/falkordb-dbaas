export abstract class ICommitRepository {
  static repositoryName: string = 'ICommitRepository';

  abstract verifyAccountCreated(accountId: string): Promise<void>;

  abstract verifyEntitlementCreated(accountId: string, entitlementId: string): Promise<void>;

  abstract verifyEntitlementDeleted(accountId: string, entitlementId: string): Promise<void>;
}
