import { FastifyBaseLogger } from 'fastify';
import { IInvitationsRepository } from '../../../../repositories/invitations/IInvitationsRepository';
import { ApiError } from '@falkordb/errors';
import { IMessagingRepository } from '../../../../repositories/messaging/IMessagingRepository';
import { IOrganizationsRepository } from '../../../../repositories/organizations/IOrganizationsRepository';
import { CreateInvitationType, InvitationType, RoleType } from '@falkordb/schemas/src/global';

export class CreateInvitationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _invitationsRepository: IInvitationsRepository,
    private _organizationsRepository: IOrganizationsRepository,
    private _messagingRepository: IMessagingRepository,
  ) {}

  async createInvitation(params: { email: string; organizationId: string; role: RoleType; inviterId: string }) {
    const expireAt = this._getInvitationExpireAt();

    const invitationRequest: CreateInvitationType = {
      email: params.email,
      organizationId: params.organizationId,
      role: params.role,
      expireAt,
      status: 'pending',
      inviterId: params.inviterId,
      // TODO: add inviterName
      inviterName: params.inviterId,
    };

    let invitation: InvitationType | null = null;
    try {
      invitation = await this._invitationsRepository.create(invitationRequest);
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create invitation', 'FAILED_TO_CREATE_INVITATION');
    }

    if (invitation) {
      await this._sendInvitationEmail(invitation);
    }
  }

  private async _sendInvitationEmail(invitation: InvitationType) {
    try {
      const organization = await this._organizationsRepository.get(invitation.organizationId);

      await this._messagingRepository.sendInvitationEmail({
        email: invitation.email,
        invitationId: invitation.id,
        inviterName: invitation.inviterName,
        organizationName: organization.name,
        role: invitation.role,
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to send invitation email', 'FAILED_TO_SEND_INVITATION_EMAIL');
    }
  }

  private _getInvitationExpireAt() {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString();
  }
}
