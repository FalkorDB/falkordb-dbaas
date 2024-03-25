import { RouteHandlerMethod } from 'fastify';
import {
  CloudProvisionConfigCreateBodySchemaType,
  CloudProvisionConfigCreateResponseSuccessSchemaType,
} from '@falkordb/schemas/src/services/provisioner/v1/cloud-provision-config';
import { ApiError } from '@falkordb/errors';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';

export const cloudProvisionConfigCreateHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: CloudProvisionConfigCreateBodySchemaType;
    Reply: CloudProvisionConfigCreateResponseSuccessSchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );

  try {
    const response = await repository.create(request.body);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
