import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationSchemaType } from '../../../schemas/operation';
import { ITenantGroupRepository } from '../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType } from '../../../schemas/tenantGroup';
import { Storage, Bucket } from '@google-cloud/storage';

export class CloudBuildOperationCallback {
  private _operationsRepository: IOperationsRepository;
  private _tenantGroupRepository: ITenantGroupRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository: IOperationsRepository,
    tenantGroupRepository: ITenantGroupRepository,
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
    if (body.tags.includes('action-refresh')) {
      return this._handleTenantGroupCallbackRefresh(body);
    }
    return;
  }

  private async _getOperation(body: CloudBuildOperationsCallbackBodySchemaType): Promise<OperationSchemaType> {
    const operationId = this._getOperationIdFromTags(body.tags);

    if (!operationId) {
      this._opts.logger.error('CloudBuildOperationCallback._getOperation: Operation ID not found', body);
      return null;
    }

    const operation = await this._operationsRepository.get(operationId);

    if (!operation) {
      this._opts.logger.error(`CloudBuildOperationCallback._getOperation: Operation not found: ${operationId}`, body);
      return null;
    }

    return operation;
  }

  private async _getOutput(operation: OperationSchemaType): Promise<object | null> {
    try {
      if (!operation.payload?.stateBucket) {
        this._opts.logger.error('CloudBuildOperationCallback._getOutput: State bucket not found', operation);
        return null;
      }

      const storage = new Storage();
      const bucket = storage.bucket(operation.payload.stateBucket);

      const filePath = `builds/${operation.id}/output.json`;
      const file = bucket.file(filePath);

      const exists = await file.exists();

      if (!exists[0]) {
        this._opts.logger.error('CloudBuildOperationCallback._getOutput: Output file not found', operation);
        return null;
      }

      const [data] = await file.download();

      return JSON.parse(data.toString());
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._getOutput: Failed to get output', operation, error);
      return null;
    }
  }

  private async _handleTenantGroupCallbackProvision(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    const operation = await this._getOperation(body);

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

    const buildOutput = await this._getOutput(operation);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'completed'),
      this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
        const clusterName =
          !!buildOutput && 'cluster_name' in buildOutput ? (buildOutput.cluster_name as string) : null;
        const clusterDomain = !!buildOutput && 'dns_name' in buildOutput ? (buildOutput.dns_name as string) : null;
        tg.status = 'ready';
        tg.tenantCount = tg.tenantCount ?? 0;
        tg.tenants = tg.tenants ?? [];
        tg.clusterName = clusterName;
        tg.clusterDomain = clusterDomain?.substring(0, clusterDomain.length - 1);
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

  private async _handleTenantGroupCallbackRefresh(body: CloudBuildOperationsCallbackBodySchemaType): Promise<void> {
    const operation = await this._getOperation(body);

    switch (body.status) {
      case 'QUEUED':
      case 'PENDING':
        return this._handleTenantGroupCallbackRefreshPending(body, operation);
      case 'WORKING':
        return this._handleTenantGroupCallbackRefreshWorking(body, operation);
      case 'SUCCESS':
        return this._handleTenantGroupCallbackRefreshSuccess(body, operation);
      case 'FAILURE':
      case 'INTERNAL_ERROR':
      case 'TIMEOUT':
      case 'CANCELLED':
      case 'EXPIRED':
        return this._handleTenantGroupCallbackRefreshFailure(body, operation);
      default:
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackRefresh: Unsupported status',
          body,
        );
        break;
    }

    return;
  }

  private async _handleTenantGroupCallbackRefreshPending(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshPending', body);
    await this._operationsRepository.updateStatus(operation.id, 'pending');
    return;
  }

  private async _handleTenantGroupCallbackRefreshWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress');
    return;
  }

  private async _handleTenantGroupCallbackRefreshSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshSuccess', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'completed'),
      this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
        tg.status = 'ready';
        tg.tenantCount = tg.tenantCount ?? 0;
        tg.tenants = tg.tenants ?? [];
        return tg;
      }),
    ]);

    if (response.some((r) => r.status === 'rejected')) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantGroupCallbackRefreshSuccess: Failed to update operation or tenant group',
        body,
        response,
      );
    }

    return;
  }

  private async _handleTenantGroupCallbackRefreshFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshFailure', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'failed'),
      this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
        tg.status = 'refreshing-failed';
        return tg;
      }),
    ]);

    if (response.some((r) => r.status === 'rejected')) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantGroupCallbackRefreshFailure: Failed to update operation or tenant group',
        body,
        response,
      );
    }
    return;
  }
}
