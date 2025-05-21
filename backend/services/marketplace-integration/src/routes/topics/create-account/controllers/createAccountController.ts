import { FastifyBaseLogger } from "fastify";
import { IOmnistrateRepository } from "../../../../repositories/omnistrate/IOmnistrateRepository";
import { ICommitRepository } from "../../../../repositories/commit/ICommitRepository";
import { CreateAccountMessageType } from "../../../../schemas/create-account";

export class CreateAccountController {
  constructor(
    private readonly omnistrateRepository: IOmnistrateRepository,
    private readonly commitRepository: ICommitRepository,
    private _opts: {
      logger: FastifyBaseLogger,
    }
  ) { }

  async createAccount({ marketplaceAccountId, companyName }: CreateAccountMessageType): Promise<void> {

    try {
      await this.omnistrateRepository.createServiceAccount({
        marketplaceAccountId,
        companyName,
      });
    } catch (error) {
      // Check if error is the account already exists
      if (error instanceof Error && error.message.includes('already exists')) {
        this._opts.logger.info({ marketplaceAccountId, companyName }, 'Account already exists');
        return;
      }

      this._opts.logger.error({ error, companyName }, `Failed to create service account: ${error.response?.data ?? error}`);
      return;
    }

    try {
      await this.commitRepository.verifyAccountCreated(marketplaceAccountId)
    } catch (error) {
      this._opts.logger.error({ error, marketplaceAccountId }, `Failed to verify account created: ${error.response?.data ?? error}`);
      return;
    }
  }

}