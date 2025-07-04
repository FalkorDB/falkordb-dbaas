import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { CloudProvisionConfigDeleteParamsSchemaType } from '@falkordb/schemas/services/provisioner/v1';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';

export const cloudProvisionConfigDeleteHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: CloudProvisionConfigDeleteParamsSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );

  try {
    const response = await repository.delete(request.params.id);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
