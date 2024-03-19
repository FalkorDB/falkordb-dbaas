import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  GetUserMembershipsRequestParamsSchemaType,
  GetUserMembershipsRequestQuerySchemaType,
  GetUserMembershipsResponseBodySchemaType,
} from '@falkordb/schemas/dist/services/users/v1';
import { IMembershipsRepository } from '../../../../repositories/membership/IMembershipsRepository';

export const getUserMembershipsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetUserMembershipsRequestParamsSchemaType;
    Querystring: GetUserMembershipsRequestQuerySchemaType;
    Reply: GetUserMembershipsResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IMembershipsRepository>(IMembershipsRepository.repositoryName);

  try {
    const { data, total } = await repository.query({
      page: request.query.page,
      pageSize: request.query.pageSize,
      userId: request.params.id,
    });
    return {
      data,
      page: request.query.page,
      pageSize: request.query.pageSize,
      total,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
