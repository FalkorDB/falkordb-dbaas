import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  ListOrganizationMembersRequestParamsType,
  ListOrganizationMembersRequestQueryType,
  ListOrganizationMembersResponseSchemaType,
} from '@falkordb/schemas/src/services/organizations/v1';
import { IMembersRepository } from '../../../../repositories/members/IMembersRepository';

export const getMembersHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: ListOrganizationMembersRequestParamsType;
    Querystring: ListOrganizationMembersRequestQueryType;
    Reply: ListOrganizationMembersResponseSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

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
