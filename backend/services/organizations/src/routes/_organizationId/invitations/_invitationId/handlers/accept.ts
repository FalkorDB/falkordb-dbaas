import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';
import {
  AcceptOrganizationInvitationRequestHeadersSchemaType,
  AcceptOrganizationInvitationRequestParamsSchemaType,
} from '@falkordb/schemas/services/organizations/v1';
import { AcceptInvitationService } from '../services/AcceptInvitationService';
import { IMembersRepository } from '../../../../../repositories/members/IMembersRepository';
import { IUsersRepository } from '../../../../../repositories/users/IUsersRepository';

export const acceptInvitationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: AcceptOrganizationInvitationRequestHeadersSchemaType;
    Params: AcceptOrganizationInvitationRequestParamsSchemaType;
  }
> = async (request) => {
  const opts = {
    logger: request.log,
  };
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const membersRepository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);

  const service = new AcceptInvitationService(opts, invitationsRepository, membersRepository, usersRepository);
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
