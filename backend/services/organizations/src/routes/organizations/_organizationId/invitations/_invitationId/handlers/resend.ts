import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { DeleteInvitationRequestParamsType, ResendInvitationRequestParamsType } from '../schemas/invitation';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';
import { ResendInvitationService } from '../services/ResendInvitationService';

export const resendInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: ResendInvitationRequestParamsType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  const service = new ResendInvitationService(opts, invitationsRepository);

  try {
    return await service.resend(request.params.invitationId);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
