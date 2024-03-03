import { RouteHandlerMethod } from 'fastify';
import { TenantGroupProvisionBodySchemaType } from '../schemas/provision';
import { TenantGroupProvisionService } from '../services/TenantGroupProvisionService';
import { ApiError } from '../../../errors/ApiError';
import { OperationsMongoDB } from '../../../repositories/operations/OperationsMongoDB';
import { CloudProvisionConfigsMongoDB } from '../../../repositories/cloud-provision-configs/CloudProvisionConfigsMongoDB';
import { TenantGroupsMongoDB } from '../../../repositories/tenant-groups/TenantGroupsMongoDB';

export const tenantGroupProvisionHandler: RouteHandlerMethod<
  undefined,
  undefined,
  undefined,
  {
    Body: TenantGroupProvisionBodySchemaType;
  }
> = async (request) => {
  const opts = { logger: request.log };
  const service = new TenantGroupProvisionService(
    opts,
    new OperationsMongoDB(opts, request.server.mongo.client),
    new CloudProvisionConfigsMongoDB(opts, request.server.mongo.client),
    new TenantGroupsMongoDB(opts, request.server.mongo.client),
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
