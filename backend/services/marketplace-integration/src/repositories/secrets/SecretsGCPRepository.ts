import { ISecretsRepository } from "./ISecretsRepository";
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class SecretsGCPRepository implements ISecretsRepository {

  private secretManagerClient: SecretManagerServiceClient;

  constructor() {
    this.secretManagerClient = new SecretManagerServiceClient();
  }

  async getSecret(secretRef: string): Promise<string | undefined> {
    try {
      const [version] = await this.secretManagerClient.accessSecretVersion({
        name: secretRef,
      });
      return version.payload.data.toString();
    } catch (error) {
      console.error(`Error accessing secret ${secretRef}:`, error);
      return undefined;
    }
  }

}