import { RoleType } from '../../schemas/roles';

export type ISendInvitationEmailParams = {
  email: string;
  organizationName: string;
  invitationId: string;
  inviterName: string;
  role: RoleType;
};

export abstract class IMessagingRepository {
  static repositoryName = 'MessagingRepository';

  abstract sendInvitationEmail(params: ISendInvitationEmailParams): Promise<void>;
}
