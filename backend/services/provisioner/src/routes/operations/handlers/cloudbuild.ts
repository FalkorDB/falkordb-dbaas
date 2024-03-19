import { RouteHandlerMethod } from 'fastify';
import {
  CloudBuildOperationsCallbackBodySchema,
  CloudBuildOperationsCallbackBodySchemaType,
} from '@falkordb/schemas/dist/services/provisioner/v1/operations';
import { CloudBuildOperationCallback } from '../services/cloudbuild/CloudBuildOperationCallback';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';

export const cloudBuildOperationsCallbackHandler: RouteHandlerMethod = async (request) => {
  const opts = {
    logger: request.log,
  };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const tenantGroupRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);
  const tenantsRepository = request.diScope.resolve<ITenantsRepository>(ITenantsRepository.repositoryName);

  const service = new CloudBuildOperationCallback(opts, operationsRepository, tenantGroupRepository, tenantsRepository);

  try {
    const message = request.server.pubsubDecode<CloudBuildOperationsCallbackBodySchemaType>(
      request,
      CloudBuildOperationsCallbackBodySchema,
    );
    return await service.handleCallback(message);
  } catch (error) {
    console.error('cloudBuildOperationsCallbackHandler', error);
    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
