import { IMessagingRepository, ISendInvitationEmailParams } from './IMessagingRepository';

export class MessagingRepositoryMock extends IMessagingRepository {
  async sendInvitationEmail(params: ISendInvitationEmailParams) {
    console.log('Sending invitation email', params);
  }
}
