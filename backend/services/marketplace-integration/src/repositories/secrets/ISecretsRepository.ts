
export abstract class ISecretsRepository {
  static repositoryName = 'ISecretsRepository';

  abstract getSecret(secretRef: string): Promise<string | undefined>;
}