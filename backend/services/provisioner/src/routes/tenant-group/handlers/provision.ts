import { RouteHandlerMethod } from 'fastify';
import { TenantGroupProvisionBodySchemaType } from '../schemas/provision';
import { TenantGroupProvisionService } from '../services/TenantGroupProvisionService';
import { ApiError } from '../../../errors/ApiError';
import { OperationsMongoDB } from '../../../repositories/operations/OperationsMongoDB';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { TenantGroupsMongoDB } from '../../../repositories/tenant-groups/TenantGroupsMongoDB';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';

export const tenantGroupProvisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: TenantGroupProvisionBodySchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const cloudProvisionConfigsRepository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );
  const tenantGroupsRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);

  const service = new TenantGroupProvisionService(
    opts,
    operationsRepository,
    cloudProvisionConfigsRepository,
    tenantGroupsRepository,
  );

  try {
    return await service.provisionTenantGroup(request.body);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
