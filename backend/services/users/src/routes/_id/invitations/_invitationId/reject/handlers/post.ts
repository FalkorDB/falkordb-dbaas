import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';
import { RejectInvitationRequestParamsSchemaType } from '../schemas/invitation';

export const rejectInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: RejectInvitationRequestParamsSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  try {
    const response = await repository.reject(request.params.invitationId);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
