import {
  ListInvitationsRequestQueryType,
  ListInvitationsResponseSchemaType,
} from '@falkordb/schemas/dist/services/organizations/v1';
import { RouteHandlerMethod } from 'fastify';
import { IInvitationsRepository } from '../../../repositories/invitations/IInvitationsRepository';
import { ApiError } from '@falkordb/errors';

export const listInvitationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Querystring: ListInvitationsRequestQueryType;
    Reply: ListInvitationsResponseSchemaType;
  }
> = async (request) => {
  const invitationsRepository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  try {
    const { count, data } = await invitationsRepository.query({
      organizationId: request.query.organizationId,
      email: request.query.email,
      page: request.query.page,
      pageSize: request.query.pageSize,
    });

    return {
      data,
      page: request.query.page,
      pageSize: request.query.pageSize,
      total: count,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
