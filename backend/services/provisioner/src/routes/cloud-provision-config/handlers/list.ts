import { RouteHandlerMethod } from 'fastify';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { ApiError } from '@falkordb/errors';
import { CloudProvisionConfigDeleteBodySchemaType } from '../schemas/delete';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { CloudProvisionConfigListQuerySchemaType } from '../schemas/list';

export const cloudProvisionConfigListHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Querystring: CloudProvisionConfigListQuerySchemaType;
  }
> = async (request) => {
  const repository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );

  try {
    const response = await repository.query(request.query);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, 'Internal Server Error', { error });
  }
};
