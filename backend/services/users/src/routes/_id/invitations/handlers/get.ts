import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  GetUserInvitationsRequestParamsSchemaType,
  GetUserInvitationsRequestQuerySchemaType,
  GetUserInvitationsResponseBodySchemaType,
} from '@falkordb/schemas/src/services/users/v1';
import { IInvitationsRepository } from '../../../../repositories/invitations/IInvitationsRepository';
import { IUsersRepository } from '../../../../repositories/users/IUsersRepository';

export const getInvitationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetUserInvitationsRequestParamsSchemaType;
    Querystring: GetUserInvitationsRequestQuerySchemaType;
    Reply: GetUserInvitationsResponseBodySchemaType;
  }
> = async (request) => {
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);
  const usersRepository = request.diScope.resolve<IUsersRepository>(IUsersRepository.repositoryName);
  try {
    const user = await usersRepository.get(request.params.id);

    const { data, total } = await invitationsRepository.query({
      page: request.query.page,
      pageSize: request.query.pageSize,
      email: user.email,
    });
    return {
      data,
      total,
      page: request.query.page,
      pageSize: request.query.pageSize,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
