import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';
import {
  RejectOrganizationInvitationRequestHeadersSchemaType,
  RejectOrganizationInvitationRequestParamsSchemaType,
} from '@falkordb/schemas/services/organizations/v1';
import { RejectInvitationService } from '../services/RejectInvitationService';
import { IUsersRepository } from '../../../../../repositories/users/IUsersRepository';

export const rejectInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: RejectOrganizationInvitationRequestHeadersSchemaType;
    Params: RejectOrganizationInvitationRequestParamsSchemaType;
  }
> = async (request) => {
  const opts = {
    logger: request.log,
  };
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  const service = new RejectInvitationService(opts, invitationsRepository, usersRepository);
  try {
    const response = await service.execute(request.params.invitationId, request.headers['x-falkordb-userId']);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
