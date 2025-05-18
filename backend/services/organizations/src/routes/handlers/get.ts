import { RouteHandlerMethod } from 'fastify';
import { ListOrganizationsRequestQueryType, ListOrganizationsResponseType } from '@falkordb/schemas/services/organizations/v1/organizations/list';
import { IOrganizationsRepository } from '../../repositories/organizations/IOrganizationsRepository';
import { ApiError } from '@falkordb/errors';

export const getOrganizationsHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Querystring: ListOrganizationsRequestQueryType;
    Reply: ListOrganizationsResponseType;
  }
> = async (request) => {
  const organizationsRepository = request.diScope.resolve<IOrganizationsRepository>(
    IOrganizationsRepository.repositoryName,
  );

  const { page, pageSize } = request.query;

  try {
    const { count, data } = await organizationsRepository.list({ page, pageSize });

    return {
      data,
      page,
      pageSize,
      total: count,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
