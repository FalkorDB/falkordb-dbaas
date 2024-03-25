import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { TenantGroupDeprovisionService } from '../services/TenantGroupDeprovisionService';
import { TenantGroupDeprovisionParamsSchemaType } from '@falkordb/schemas/dist/services/provisioner/v1/tenant-group'
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';

export const tenantGroupDeprovisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: TenantGroupDeprovisionParamsSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const cloudProvisionConfigsRepository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );
  const tenantGroupsRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);

  const service = new TenantGroupDeprovisionService(
    opts,
    operationsRepository,
    cloudProvisionConfigsRepository,
    tenantGroupsRepository,
  );

  try {
    return await service.deprovisionTenantGroup(request.params.id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
