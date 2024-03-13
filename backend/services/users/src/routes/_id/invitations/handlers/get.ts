import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  GetInvitationsRequestParamsSchemaType,
  GetInvitationsRequestQuerySchemaType,
  GetInvitationsResponseBodySchemaType,
} from '@falkordb/schemas/src/services/users/v1';
import { IInvitationsRepository } from '../../../../repositories/invitations/IInvitationsRepository';
import { IUsersRepository } from '../../../../repositories/users/IUsersRepository';

export const getInvitationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetInvitationsRequestParamsSchemaType;
    Querystring: GetInvitationsRequestQuerySchemaType;
    Reply: GetInvitationsResponseBodySchemaType;
  }
> = async (request) => {
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);
  try {
    const user = await usersRepository.get(request.params.id);

    const response = await invitationsRepository.query({
      page: request.query.page,
      pageSize: request.query.pageSize,
      email: user.email,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
