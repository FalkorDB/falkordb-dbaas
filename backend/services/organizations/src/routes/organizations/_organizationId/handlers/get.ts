import { RouteHandlerMethod } from 'fastify';
import { GetOrganizationRequestParamsType, GetOrganizationResponseSchemaType } from '../schemas/organization';
import { IOrganizationsRepository } from '../../../../repositories/organizations/IOrganizationsRepository';
import { ApiError } from '@falkordb/errors';

export const getOrganizationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: GetOrganizationRequestParamsType;
    Reply: GetOrganizationResponseSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IOrganizationsRepository>(IOrganizationsRepository.repositoryName);

  try {
    return await repository.get(request.params.id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
