import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { DeleteInvitationRequestParamsType } from '../schemas/invitation';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';

export const deleteInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteInvitationRequestParamsType;
  }
> = async (request) => {
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  try {
    return await invitationsRepository.delete(request.params.invitationId);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
