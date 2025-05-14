import {
  ListMembersRequestQueryType,
  ListMembersResponseSchemaType,
} from '@falkordb/schemas/services/organizations/v1';
import { RouteHandlerMethod } from 'fastify';
import { IMembersRepository } from '../../../repositories/members/IMembersRepository';
import { ApiError } from '@falkordb/errors';

export const listMembersHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Querystring: ListMembersRequestQueryType;
    Reply: ListMembersResponseSchemaType;
  }
> = async (request) => {
  const membersRepository = request.diScope.resolve<IMembersRepository>(IMembersRepository.repositoryName);

  try {
    const { count, data } = await membersRepository.query({
      organizationId: request.query.organizationId,
      role: request.query.role,
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
