import { RouteHandlerMethod } from 'fastify';
import { CloudProvisionConfigCreateBodySchemaType, CloudProvisionConfigCreateResponseSuccessSchemaType } from '../schemas/create';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { ApiError } from '../../../errors/ApiError';

export const cloudProvisionConfigCreateHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: CloudProvisionConfigCreateBodySchemaType;
    Reply: CloudProvisionConfigCreateResponseSuccessSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const repository = new CloudProvisionConfigsMongoDB(opts, request.server.mongo.client);

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
