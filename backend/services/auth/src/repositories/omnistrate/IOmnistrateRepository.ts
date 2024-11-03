export abstract class IOmnistrateRepository {
  static repositoryName: string = 'IOmnistrateRepository';

  abstract getToken(): Promise<string>;
}
