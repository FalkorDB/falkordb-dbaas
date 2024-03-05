import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from '../../../repositories/operations/IOperationsRepository';
import { CloudBuildOperationsCallbackBodySchemaType } from '../schemas/cloudbuild';
import { OperationSchemaType } from '../../../schemas/operation';
import { Storage, Bucket } from '@google-cloud/storage';
import { ITenantsRepository } from '../../../repositories/tenants/ITenantRepository';
import { TenantSchemaType } from '../../../schemas/tenant';

export class CloudBuildOperationCallbackTenant {
  private _operationsRepository: IOperationsRepository;
  private _tenantsRepository: ITenantsRepository;

  constructor(
    private _opts: {
      logger: FastifyBaseLogger;
    },
    operationsRepository: IOperationsRepository,
    tenantsRepository: ITenantsRepository,
  ) {
    this._operationsRepository = operationsRepository;
    this._tenantsRepository = tenantsRepository;
  }

  async handleCallback(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.debug('CloudBuildOperationCallback._handleTenantCallback', body);

    if (body.data.tags.includes('action-provision')) {
      return this._handleTenantCallbackProvision(body, operation);
    }
    return;
  }

  private async _getOutput(
    buildId: string,
    operation: OperationSchemaType,
  ): Promise<{
    [key: string]: { value: string };
  } | null> {
    try {
      if (!operation.payload?.stateBucket) {
        this._opts.logger.error('CloudBuildOperationCallback._getOutput: State bucket not found', operation);
        return null;
      }

      const storage = new Storage();
      const bucket = storage.bucket(operation.payload.stateBucket);

      const filePath = `builds/${buildId}/output.json`;
      const file = bucket.file(filePath);

      const [exists] = await file.exists();

      if (!exists) {
        console.log('CloudBuildOperationCallback._getOutput: Output file not found', filePath);
        this._opts.logger.error(`CloudBuildOperationCallback._getOutput: Output file not found`, operation);
        return null;
      }

      const [data] = await file.download();

      return JSON.parse(data.toString());
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._getOutput: Failed to get output', operation, error);
      return null;
    }
  }

  private async _handleTenantCallbackProvision(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    switch (body.data.status) {
      case 'QUEUED':
      case 'PENDING':
        return this._handleTenantCallbackProvisionPending(body, operation);
      case 'WORKING':
        return this._handleTenantCallbackProvisionWorking(body, operation);
      case 'SUCCESS':
        return this._handleTenantCallbackProvisionSuccess(body, operation);
      case 'FAILURE':
      case 'INTERNAL_ERROR':
      case 'TIMEOUT':
      case 'CANCELLED':
      case 'EXPIRED':
        return this._handleTenantCallbackProvisionFailure(body, operation);
      default:
        this._opts.logger.error('CloudBuildOperationCallback._handleTenantCallbackProvision: Unsupported status', body);
        break;
    }

    return;
  }

  private async _handleTenantCallbackProvisionPending(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantCallbackProvisionPending', body);
    await this._operationsRepository.updateStatus(operation.id, 'pending', { buildId: body.data.id });
    return;
  }

  private async _handleTenantCallbackProvisionWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantCallbackProvisionWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress', { buildId: body.data.id });
    return;
  }

  private async _handleTenantCallbackProvisionSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    try {
      this._opts.logger.info('CloudBuildOperationCallback._handleTenantCallbackProvisionSuccess', body);

      const buildOutput = await this._getOutput(body.data.id, operation);

      const response = await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'completed', { buildId: body.data.id }),
        this._tenantsRepository.runTransaction<TenantSchemaType>(operation.resourceId, async (tg) => {
          const domain = !!buildOutput && 'falkordb_host' in buildOutput ? buildOutput.falkordb_host?.value : null;
          const port =
            !!buildOutput && 'falkordb_redis_port' in buildOutput ? buildOutput.falkordb_redis_port?.value : null;
          tg.status = 'ready';
          tg.domain = domain;
          tg.port = port;
          return tg;
        }),
      ]);

      if (response.some((r) => r.status === 'rejected')) {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantCallbackProvisionSuccess: Failed to update operation or tenant group',
          body,
          response,
        );
      }

      return;
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._handleTenantCallbackProvisionSuccess', error);
      await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantsRepository.runTransaction<TenantSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'provisioning-failed';
          return tg;
        }),
      ]).catch((error) => {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantCallbackProvisionSuccess: Failed to update operation or tenant group',
          body,
          error,
        );
      });
    }
  }

  private async _handleTenantCallbackProvisionFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantCallbackProvisionFailure', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
      this._tenantsRepository.runTransaction<TenantSchemaType>(operation.resourceId, async (tg) => {
        tg.status = 'provisioning-failed';
        return tg;
      }),
    ]);

    if (response.some((r) => r.status === 'rejected')) {
      this._opts.logger.error(
        'CloudBuildOperationCallback._handleTenantCallbackProvisionFailure: Failed to update operation or tenant group',
        body,
        response,
      );
    }
    return;
  }
}
