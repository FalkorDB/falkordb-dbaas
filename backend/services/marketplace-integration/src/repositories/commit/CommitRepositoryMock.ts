import { ICommitRepository } from './ICommitRepository';

export class CommitRepositoryMock implements ICommitRepository {
  async verifyAccountCreated(accountId: string): Promise<void> {
    console.log(`verifyAccountCreated: ${accountId}`);
  }

  async verifyEntitlementCreated(accountId: string, entitlementId: string): Promise<void> {
    console.log(`verifyEntitlementCreated: ${accountId}, ${entitlementId}`);
  }

  async verifyEntitlementDeleted(accountId: string, entitlementId: string): Promise<void> {
    console.log(`verifyEntitlementDeleted: ${accountId}, ${entitlementId}`);
  }
}
