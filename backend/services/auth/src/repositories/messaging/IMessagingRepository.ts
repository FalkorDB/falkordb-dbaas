export type ISendRecoverPasswordEmailParams = {
  email: string;
  recoverPasswordUrl: string;
};

export abstract class IMessagingRepository {
  static repositoryName = 'MessagingRepository';

  abstract sendRecoverPasswordEmail(params: ISendRecoverPasswordEmailParams): Promise<void>;
}
