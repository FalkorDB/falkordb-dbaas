import { RouteHandlerMethod } from 'fastify';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationsMongoDB } from '../../../repositories/operations/OperationsMongoDB';
import { CloudBuildOperationCallback } from '../services/CloudBuildOperationCallback';
import { TenantGroupsMongoDB } from '../../../repositories/tenant-groups/TenantGroupsMongoDB';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';

export const cloudBuildOperationsCallbackHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: CloudBuildOperationsCallbackBodySchemaType;
  }
> = async (request) => {
  const opts = {
    logger: request.log,
  };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const tenantGroupRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);

  const service = new CloudBuildOperationCallback(opts, operationsRepository, tenantGroupRepository);

  try {
    return await service.handleCallback(request.body);
  } catch (error) {
    console.error('cloudBuildOperationsCallbackHandler', error);
    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
