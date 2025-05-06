import { FastifyBaseLogger, FastifyRequest } from "fastify";
import { IOmnistrateRepository } from "../../../../repositories/omnistrate/IOmnistrateRepository";
import { ICommitRepository } from "../../../../repositories/commit/ICommitRepository";
import { CreateAccountMessageType } from "../../../../schemas/create-account";
import { ApiError } from "@falkordb/errors";
import { ISecretsRepository } from "../../../../repositories/secrets/ISecretsRepository";


export class CreateAccountController {
  constructor(
    private readonly omnistrateRepository: IOmnistrateRepository,
    private readonly commitRepository: ICommitRepository,
    private readonly secretsRepository: ISecretsRepository,
    private _opts: {
      logger: FastifyBaseLogger,
    }
  ) { }

  async createAccount({ marketplaceAccountId, userEmail, companyName, name, passwordRef }: CreateAccountMessageType): Promise<void> {

    let password = null;
    try {
      password = await this.secretsRepository.getSecret(passwordRef);
    } catch (error) {
      this._opts.logger.error({ error, passwordRef }, `Failed to get password from secret manager: ${error}`);
      throw ApiError.internalServerError("Failed to get password from secret manager", "PASSWORD_SECRET_MANAGER_ERROR");
    }

    if (!password) {
      this._opts.logger.error({ passwordRef }, `Password not found in secret manager`);
      return;
    }

    try {
      await this.omnistrateRepository.createReadOnlySubscription({
        marketplaceAccountId,
        userEmail,
      });
    } catch (error) {
      // Check if error is the account already exists
      if (error instanceof Error && error.message.includes('already exists')) {
        this._opts.logger.info({ marketplaceAccountId, userEmail }, 'Account already exists');
        return;
      }

      this._opts.logger.error({ error, marketplaceAccountId, userEmail }, `Failed to create read-only subscription: ${error}`);
      return;
    }

    try {
      await this.commitRepository.verifyAccountCreated(marketplaceAccountId);
    } catch (error) {
      this._opts.logger.error({ error, marketplaceAccountId, userEmail }, `Failed to verify account creation: ${error}`);
    }
  }
}