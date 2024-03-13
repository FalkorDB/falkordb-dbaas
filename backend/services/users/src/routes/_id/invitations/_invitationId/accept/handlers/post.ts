import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../../repositories/invitations/IInvitationsRepository';
import { AcceptInvitationRequestParamsSchemaType } from '@falkordb/schemas/src/services/users/v1';

export const acceptInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: AcceptInvitationRequestParamsSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  try {
    const response = await repository.accept(request.params.invitationId);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
