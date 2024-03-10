import { FastifyBaseLogger } from 'fastify';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';
import { CreateInvitationType } from '../../../../../schemas/invitation';
import { RoleType } from '../../../../../schemas/roles';
import { ApiError } from '@falkordb/errors';

export class CreateInvitationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _invitationsRepository: IInvitationsRepository,
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
    try {
      const invitation = await this._invitationsRepository.create(invitationRequest);
      // TODO: Send email
      return invitation;
    } catch (error) {
      this._opts.logger.error(error);
      throw ApiError.internalServerError('Failed to create invitation', 'FAILED_TO_CREATE_INVITATION');
    }
  }

  private _getInvitationExpireAt() {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now.toISOString();
  }
}
