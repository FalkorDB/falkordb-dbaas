import { RouteHandlerMethod } from 'fastify';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { ApiError } from '../../../errors/ApiError';
import { CloudProvisionConfigDeleteBodySchemaType } from '../schemas/delete';

export const cloudProvisionConfigDeleteHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: CloudProvisionConfigDeleteBodySchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const repository = new CloudProvisionConfigsMongoDB(opts, request.server.mongo.client);

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
