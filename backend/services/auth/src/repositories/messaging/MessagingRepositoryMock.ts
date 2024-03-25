import { IMessagingRepository, ISendRecoverPasswordEmailParams } from './IMessagingRepository';

export class MessagingRepositoryMock extends IMessagingRepository {
  async sendRecoverPasswordEmail(params: ISendRecoverPasswordEmailParams) {
    console.log('Sending recover password email', params);
  }
}
