import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationSchemaType } from '../../../schemas/operation';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';
import { Storage, Bucket } from '@google-cloud/storage';
import { CloudBuildOperationCallbackTenantGroup } from './CloudBuildOperationCallbackTenantGroup';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { CloudBuildOperationCallbackTenant } from './CloudBuildOperationCallbackTenant';

export class CloudBuildOperationCallback {
  private _operationsRepository: IOperationsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;
  private _tenantRepository: ITenantsRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository: IOperationsRepository,
    tenantGroupRepository: ITenantGroupRepository,
    tenantsRepository: ITenantsRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._tenantGroupRepository = tenantGroupRepository;
    this._tenantRepository = tenantsRepository;
  }

  async handleCallback(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    this._opts.logger.debug('CloudBuildOperationCallback.handleCallback', body);
    const operationId = this._getOperationIdFromTags(body.data.tags);

    this._opts.logger.debug(`CloudBuildOperationCallback.handleCallback: Operation ID ${operationId}`);

    if (!operationId) {
      console.log('CloudBuildOperationCallback.handleCallback: Operation ID not found', body);
      this._opts.logger.debug('CloudBuildOperationCallback.handleCallback: Operation ID not found', body);
      return;
    }

    const operation = await this._operationsRepository
      .lastPublishTimeTransaction(operationId, body.publishTime)
      .catch((err) => {
        console.error('CloudBuildOperationCallback.handleCallback: Failed to get operation', err);

        this._opts.logger.debug('CloudBuildOperationCallback.handleCallback: Failed to get operation', err);
        return null;
      });

    if (!operation) {
      console.log('CloudBuildOperationCallback.handleCallback: Operation not found', body);

      this._opts.logger.debug('CloudBuildOperationCallback.handleCallback: Operation not found', body);
      return;
    }

    this._opts.logger.debug(`CloudBuildOperationCallback.handleCallback: Operation found: ${operation.id}`);

    if (body.data.tags.includes('resource-tenant-group')) {
      const service = new CloudBuildOperationCallbackTenantGroup(
        this._opts,
        this._operationsRepository,
        this._tenantGroupRepository,
      );
      await service.handleCallback(body, operation);
      return;
    }

    if (body.data.tags.includes('resource-tenant')) {
      const service = new CloudBuildOperationCallbackTenant(
        this._opts,
        this._operationsRepository,
        this._tenantRepository,
      );
      await service.handleCallback(body, operation);
      return;
    }

    return;
  }

  private _getOperationIdFromTags(tags: string[]): string {
    const tag = tags.find((tag) => tag.startsWith('operationId-')) ?? null;
    if (!tag) {
      return null;
    }
    return tag.split('-').slice(1).join('-');
  }
}
