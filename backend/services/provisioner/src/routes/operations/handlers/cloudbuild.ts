import { RouteHandlerMethod } from 'fastify';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationsMongoDB } from '../../../repositories/operations/OperationsMongoDB';
import { CloudBuildOperationCallback } from '../services/CloudBuildOperationCallback';

export const cloudBuildOperationsCallbackHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: CloudBuildOperationsCallbackBodySchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const service = new CloudBuildOperationCallback(opts, new OperationsMongoDB(opts, request.server.mongo.client));

  try {
    return await service.handleCallback(request.body);
  } catch (error) {
    console.error('cloudBuildOperationsCallbackHandler', error);
    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
