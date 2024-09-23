export abstract class IMailRepository {
  static repositoryName: string = 'IMailRepository';

  abstract sendFreeInstanceCreatedEmail(params: {
    email: string;
    instanceId: string;
    omnistrateServiceId: string;
    omnistrateEnvironmentId: string;
    omnistrateFreeResourceId: string;
    omnistrateFreeTierId: string;
    username: string;
    password: string;
  }): Promise<void>;
}
