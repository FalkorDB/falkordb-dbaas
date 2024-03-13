import { FastifyBaseLogger } from 'fastify';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';
import { IMembersRepository } from '../../../../../repositories/members/IMembersRepository';
import { ApiError } from '@falkordb/errors';
import { IUsersRepository } from '../../../../../repositories/users/IUsersRepository';

export class AcceptInvitationService {
  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    private _invitationsRepository: IInvitationsRepository,
    private _membersRepository: IMembersRepository,
    private _usersRepository: IUsersRepository,
  ) {}

  async execute(invitationId: string, userId: string) {
    const [invitation, user] = await Promise.all([
      this._invitationsRepository.get(invitationId),
      this._usersRepository.get(userId),
    ]);

    if (!user) {
      throw ApiError.notFound('User not found', 'USER_NOT_FOUND');
    }

    if (!invitation) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.email !== user.email) {
      throw ApiError.notFound('Invitation not found', 'INVITATION_NOT_FOUND');
    }

    if (invitation.status !== 'pending') {
      throw ApiError.badRequest('Invitation is not pending', 'INVITATION_NOT_PENDING');
    }

    await this._membersRepository.create({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
    });

    await this._invitationsRepository.update(invitationId, {
      status: 'accepted',
    });
  }
}
