import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import {
  GetMembershipsRequestParamsSchemaType,
  GetMembershipsRequestQuerySchemaType,
  GetMembershipsResponseBodySchemaType,
} from '../schemas/memberships';
import { IMembershipsRepository } from '../../../../repositories/membership/IMembershipsRepository';

export const getUserMembershipsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetMembershipsRequestParamsSchemaType;
    Querystring: GetMembershipsRequestQuerySchemaType;
    Reply: GetMembershipsResponseBodySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IMembershipsRepository>(IMembershipsRepository.repositoryName);

  try {
    const response = await repository.query({
      page: request.query.page,
      pageSize: request.query.pageSize,
      userId: request.params.id,
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
