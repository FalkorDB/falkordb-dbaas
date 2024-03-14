import { FastifyBaseLogger } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';
import { IMessagingRepository } from '../../../../../../repositories/messaging/IMessagingRepository';
import { InvitationType } from '../../../../../../schemas/invitation';
import { IOrganizationsRepository } from '../../../../../../repositories/organizations/IOrganizationsRepository';

export class ResendInvitationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _invitationsRepository: IInvitationsRepository,
    private _organizationsRepository: IOrganizationsRepository,
    private _messagingRepository: IMessagingRepository,
  ) {}

  async resend(invitationId: string) {
    const invitation = await this._invitationsRepository.get(invitationId);

    if (invitation.status !== 'pending' && invitation.status !== 'expired') {
      throw ApiError.badRequest('Invitation is not pending or expired', 'INVITATION_NOT_PENDING_OR_EXPIRED');
    }

    let invitationUpdated: InvitationType | null = null;
    try {
      invitationUpdated = await this._invitationsRepository.update(invitationId, {
        expireAt: this._getInvitationExpireAt(),
        status: 'pending',
      });
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to resend invitation', 'FAILED_TO_RESEND_INVITATION');
    }

    if (invitationUpdated) {
      await this._sendInvitationEmail(invitationUpdated);
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
