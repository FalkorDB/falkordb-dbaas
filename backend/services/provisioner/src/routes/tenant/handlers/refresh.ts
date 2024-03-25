import { RouteHandlerMethod } from 'fastify';
import { TenantProvisionService } from '../services/TenantProvisionService';
import { ApiError } from '@falkordb/errors';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { TenantRefreshParamsSchemaType } from '@falkordb/schemas/dist/services/provisioner/v1/tenant'
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';

export const tenantRefreshHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: TenantRefreshParamsSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const cloudProvisionConfigsRepository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );
  const tenantGroupsRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);
  const tenantsRepository = request.diScope.resolve<ITenantsRepository>(ITenantsRepository.repositoryName);

  const service = new TenantProvisionService(
    opts,
    operationsRepository,
    cloudProvisionConfigsRepository,
    tenantGroupsRepository,
    tenantsRepository,
  );

  try {
    return await service.refreshTenant(request.params);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
