import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '@falkordb/errors';
import { TenantDeprovisionParamsSchemaType } from '@falkordb/schemas/services/provisioner/v1';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantDeprovisionService } from '../services/TenantDeprovisionService';

export const tenantDeprovisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: TenantDeprovisionParamsSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };

  const operationsRepository = request.diScope.resolve<IOperationsRepository>(IOperationsRepository.repositoryName);
  const cloudProvisionConfigsRepository = request.diScope.resolve<ICloudProvisionConfigsRepository>(
    ICloudProvisionConfigsRepository.repositoryName,
  );
  const tenantGroupsRepository = request.diScope.resolve<ITenantGroupRepository>(ITenantGroupRepository.repositoryName);
  const tenantsRepository = request.diScope.resolve<ITenantsRepository>(ITenantsRepository.repositoryName);

  const service = new TenantDeprovisionService(
    opts,
    operationsRepository,
    cloudProvisionConfigsRepository,
    tenantGroupsRepository,
    tenantsRepository,
  );

  try {
    return await service.deprovisionTenant(request.params.id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
