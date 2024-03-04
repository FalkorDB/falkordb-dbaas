import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationSchemaType } from '../../../schemas/operation';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';

export class CloudBuildOperationCallback {
  private _operationsRepository: IOperationsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository?: IOperationsRepository,
    tenantGroupRepository?: ITenantGroupRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._tenantGroupRepository = tenantGroupRepository;
  }

  async handleCallback(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback.handleCallback', body);

    if (body.tags.includes('tenant-group')) {
      return this._handleTenantGroupCallback(body);
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

  private async _handleTenantGroupCallback(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    if (body.tags.includes('action-provision')) {
      return this._handleTenantGroupCallbackProvision(body);
    }

    return;
  }

  private async _handleTenantGroupCallbackProvision(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    const operationId = this._getOperationIdFromTags(body.tags);

    if (!operationId) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantGroupCallbackProvision: Operation ID not found',
        body,
      );
      return;
    }

    const operation = await this._operationsRepository.get(operationId);

    if (!operation) {
      this._opts.logger.error(
        `CloudBuildOperationCallback._handleTenantGroupCallbackProvision: Operation not found: ${operationId}`,
        body,
      );
      return;
    }

    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvision', operation);

    switch (body.status) {
      case 'QUEUED':
      case 'PENDING':
        return this._handleTenantGroupCallbackProvisionPending(body, operation);
      case 'WORKING':
        return this._handleTenantGroupCallbackProvisionWorking(body, operation);
      case 'SUCCESS':
        return this._handleTenantGroupCallbackProvisionSuccess(body, operation);
      case 'FAILURE':
      case 'INTERNAL_ERROR':
      case 'TIMEOUT':
      case 'CANCELLED':
      case 'EXPIRED':
        return this._handleTenantGroupCallbackProvisionFailure(body, operation);
      default:
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackProvision: Unsupported status',
          body,
        );
        break;
    }

    return;
  }

  private async _handleTenantGroupCallbackProvisionPending(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionPending', body);
    await this._operationsRepository.updateStatus(operation.id, 'pending');
    return;
  }

  private async _handleTenantGroupCallbackProvisionWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress');
    return;
  }

  private async _handleTenantGroupCallbackProvisionSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess', body);
    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'completed'),
      this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
        tg.status = 'ready';
        return tg;
      }),
    ]);

    if (response.some((r) => r.status === 'rejected')) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess: Failed to update operation or tenant group',
        body,
        response,
      );
    }

    return;
  }

  private async _handleTenantGroupCallbackProvisionFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionFailure', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'failed'),
      this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
        tg.status = 'provisioning-failed';
        return tg;
      }),
    ]);

    if (response.some((r) => r.status === 'rejected')) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantGroupCallbackProvisionFailure: Failed to update operation or tenant group',
        body,
        response,
      );
    }
    return;
  }
}
