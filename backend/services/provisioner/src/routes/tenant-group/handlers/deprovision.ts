import { RouteHandlerMethod } from 'fastify';
import { ApiError } from '../../../errors/ApiError';
import { OperationsMongoDB } from '../../../repositories/operations/OperationsMongoDB';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { TenantGroupsMongoDB } from '../../../repositories/tenant-groups/TenantGroupsMongoDB';
import { TenantGroupDeprovisionService } from '../services/TenantGroupDeprovisionService';
import { TenantGroupDeprovisionParamsSchemaType } from '../schemas/deprovision';

export const tenantGroupDeprovisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Params: TenantGroupDeprovisionParamsSchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const service = new TenantGroupDeprovisionService(
    opts,
    new OperationsMongoDB(opts, request.server.mongo.client),
    new CloudProvisionConfigsMongoDB(opts, request.server.mongo.client),
    new TenantGroupsMongoDB(opts, request.server.mongo.client),
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
