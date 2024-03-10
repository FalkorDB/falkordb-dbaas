import { FastifyBaseLogger } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';

export class ResendInvitationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _invitationsRepository: IInvitationsRepository,
  ) {}

  async resend(invitationId: string) {
    const invitation = await this._invitationsRepository.get(invitationId);

    if (invitation.status !== 'pending' && invitation.status !== 'expired') {
      throw ApiError.badRequest('Invitation is not pending or expired', 'INVITATION_NOT_PENDING_OR_EXPIRED');
    }

    try {
      const invitation = await this._invitationsRepository.update(invitationId, {
        expireAt: this._getInvitationExpireAt(),
        status: 'pending',
      });
      // TODO: Send email
      return invitation;
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to resend invitation', 'FAILED_TO_RESEND_INVITATION');
    }
  }

  private _getInvitationExpireAt() {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString();
  }
}
