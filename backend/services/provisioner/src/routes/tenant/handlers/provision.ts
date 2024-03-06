import { RouteHandlerMethod } from 'fastify';
import { TenantProvisionBodySchemaType, TenantProvisionHeadersSchemaType } from '../schemas/provision';
import { TenantProvisionService } from '../services/TenantProvisionService';
import { ApiError } from '@falkordb/errors';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { ICloudProvisionConfigsRepository } from '../../../repositories/cloud-provision-configs/ICloudProvisionConfigsRepository';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';

export const tenantProvisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Headers: TenantProvisionHeadersSchemaType;
    Body: TenantProvisionBodySchemaType;
  }
> = async (request, reply) => {
  const userId = request.headers['x-falkordb-userid'];
  const organizationId = request.headers['x-falkordb-organizationid'];

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
    return await service.provisionTenant({ ...request.body, creatorUserId: userId, organizationId });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error.toFastify(request.server);
    }

    throw request.server.httpErrors.createError(500, error?.message ?? 'Internal Server Error', { error });
  }
};
