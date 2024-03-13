import { RouteHandlerMethod } from 'fastify';
import {
  UpdateOrganizationRequestBodyType,
  UpdateOrganizationRequestParamsType,
  UpdateOrganizationResponseSchemaType,
} from '@falkordb/schemas/src/services/organizations/v1';
import { IOrganizationsRepository } from '../../../../repositories/organizations/IOrganizationsRepository';
import { ApiError } from '@falkordb/errors';

export const updateOrganizationHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: UpdateOrganizationRequestParamsType;
    Body: UpdateOrganizationRequestBodyType;
    Reply: UpdateOrganizationResponseSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<IOrganizationsRepository>(IOrganizationsRepository.repositoryName);

  try {
    return await repository.update(request.params.organizationId, request.body);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
