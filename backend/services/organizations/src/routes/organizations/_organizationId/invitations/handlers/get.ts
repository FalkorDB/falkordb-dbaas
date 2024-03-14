import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  ListInvitationsRequestParamsType,
  ListInvitationsRequestQueryType,
  ListInvitationsResponseSchemaType,
} from '../schemas/invitations';
import { IInvitationsRepository } from '../../../../../repositories/invitations/IInvitationsRepository';

export const getInvitationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: ListInvitationsRequestParamsType;
    Querystring: ListInvitationsRequestQueryType;
    Reply: ListInvitationsResponseSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IInvitationsRepository>(IInvitationsRepository.repositoryName);

  try {
    const { data, count } = await repository.query({
      organizationId: request.params.organizationId,
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
