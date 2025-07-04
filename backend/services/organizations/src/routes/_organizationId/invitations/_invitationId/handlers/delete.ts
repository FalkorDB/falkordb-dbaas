import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { DeleteOrganizationInvitationRequestParamsType } from '@falkordb/schemas/services/organizations/v1';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';

export const deleteInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: DeleteOrganizationInvitationRequestParamsType;
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
