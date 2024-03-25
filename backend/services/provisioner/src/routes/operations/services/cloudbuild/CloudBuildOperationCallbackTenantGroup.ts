import { FastifyBaseLogger } from 'fastify';
import { IOperationsRepository } from '../../../../repositories/operations/IOperationsRepository';
import { ITenantGroupRepository } from '../../../../repositories/tenant-groups/ITenantGroupsRepository';
import { TenantGroupSchemaType } from '@falkordb/schemas/src/global/tenantGroup';
import { Storage, Bucket } from '@google-cloud/storage';
import { CloudBuildOperationsCallbackBodySchemaType } from '@falkordb/schemas/src/services/provisioner/v1/operations';
import { OperationSchemaType } from '@falkordb/schemas/src/global';

export class CloudBuildOperationCallbackTenantGroup {
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

  async handleCallback(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.debug('CloudBuildOperationCallback._handleTenantGroupCallback', body);

    if (body.data.tags.includes('action-provision')) {
      return this._handleTenantGroupCallbackProvision(body, operation);
    }
    if (body.data.tags.includes('action-refresh')) {
      return this._handleTenantGroupCallbackRefresh(body, operation);
    }
    if (body.data.tags.includes('action-deprovision')) {
      return this._handleTenantGroupCallbackDeprovision(body, operation);
    }
    return;
  }

  private async _getOutput(
    buildId: string,
    operation: OperationSchemaType,
    folder: 'infra' | 'k8s',
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

      const filePath = `builds/${buildId}/${folder}.output.json`;
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

  private async _handleTenantGroupCallbackProvision(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    switch (body.data.status) {
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
    await this._operationsRepository.updateStatus(operation.id, 'pending', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackProvisionWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackProvisionSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    try {
      this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess', body);

      const [infraOutput] = await Promise.all([this._getOutput(body.data.id, operation, 'infra')]);

      const response = await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'completed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          const clusterName = !!infraOutput && 'cluster_name' in infraOutput ? infraOutput.cluster_name?.value : null;
          const clusterDomain = !!infraOutput && 'dns_name' in infraOutput ? infraOutput.dns_name?.value : null;
          const vpcName = !!infraOutput && 'vpc_name' in infraOutput ? infraOutput.vpc_name?.value : null;
          const clusterEndpoint =
            !!infraOutput && 'cluster_endpoint' in infraOutput ? infraOutput.cluster_endpoint?.value : null;
          const clusterCaCertificate =
            !!infraOutput && 'cluster_ca_certificate' in infraOutput ? infraOutput.cluster_ca_certificate?.value : null;
          const ipAddress = !!infraOutput && 'ip_address' in infraOutput ? infraOutput.ip_address?.value : null;
          const backupBucketName =
            !!infraOutput && 'backup_bucket_name' in infraOutput ? infraOutput.backup_bucket_name?.value : null;
          const veleroGcpSaId =
            !!infraOutput && 'velero_gcp_sa_id' in infraOutput ? infraOutput.velero_gcp_sa_id?.value : null;
          const veleroGcpSaEmail =
            !!infraOutput && 'velero_gcp_sa_email' in infraOutput ? infraOutput.velero_gcp_sa_email?.value : null;
          tg.status = 'ready';
          tg.tenantCount = tg.tenantCount ?? 0;
          tg.tenants = tg.tenants ?? [];
          tg.clusterName = clusterName;
          tg.clusterDomain = clusterDomain?.substring(0, clusterDomain.length - 1);
          tg.vpcName = vpcName;
          tg.clusterEndpoint = clusterEndpoint;
          tg.clusterCaCertificate = clusterCaCertificate;
          tg.ipAddress = ipAddress;
          tg.backupBucketName = backupBucketName;
          tg.veleroGcpSaId = veleroGcpSaId;
          tg.veleroGcpSaEmail = veleroGcpSaEmail;
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
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess', error);
      await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'provisioning-failed';
          return tg;
        }),
      ]).catch((error) => {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess: Failed to update operation or tenant group',
          body,
          error,
        );
      });
    }
  }

  private async _handleTenantGroupCallbackProvisionFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackProvisionFailure', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
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

  private async _handleTenantGroupCallbackRefresh(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    switch (body.data.status) {
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
    await this._operationsRepository.updateStatus(operation.id, 'pending', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackRefreshWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackRefreshSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    try {
      this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshSuccess', body);

      const [infraOutput] = await Promise.all([this._getOutput(body.data.id, operation, 'infra')]);

      const response = await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'completed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          const clusterName = !!infraOutput && 'cluster_name' in infraOutput ? infraOutput.cluster_name?.value : null;
          const clusterDomain = !!infraOutput && 'dns_name' in infraOutput ? infraOutput.dns_name?.value : null;
          const vpcName = !!infraOutput && 'vpc_name' in infraOutput ? infraOutput.vpc_name?.value : null;
          const clusterEndpoint =
            !!infraOutput && 'cluster_endpoint' in infraOutput ? infraOutput.cluster_endpoint?.value : null;
          const clusterCaCertificate =
            !!infraOutput && 'cluster_ca_certificate' in infraOutput ? infraOutput.cluster_ca_certificate?.value : null;
          const ipAddress = !!infraOutput && 'ip_address' in infraOutput ? infraOutput.ip_address?.value : null;
          const backupBucketName =
            !!infraOutput && 'backup_bucket_name' in infraOutput ? infraOutput.backup_bucket_name?.value : null;
          const veleroGcpSaId =
            !!infraOutput && 'velero_gcp_sa_id' in infraOutput ? infraOutput.velero_gcp_sa_id?.value : null;
          const veleroGcpSaEmail =
            !!infraOutput && 'velero_gcp_sa_email' in infraOutput ? infraOutput.velero_gcp_sa_email?.value : null;
          tg.status = 'ready';
          tg.tenantCount = tg.tenantCount ?? 0;
          tg.tenants = tg.tenants ?? [];
          tg.clusterName = clusterName;
          tg.clusterDomain = clusterDomain?.substring(0, clusterDomain.length - 1);
          tg.vpcName = vpcName;
          tg.clusterEndpoint = clusterEndpoint;
          tg.clusterCaCertificate = clusterCaCertificate;
          tg.ipAddress = ipAddress;
          tg.backupBucketName = backupBucketName;
          tg.veleroGcpSaId = veleroGcpSaId;
          tg.veleroGcpSaEmail = veleroGcpSaEmail;
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
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshSuccess', error);
      await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'refreshing-failed';
          return tg;
        }),
      ]).catch((error) => {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackProvisionSuccess: Failed to update operation or tenant group',
          body,
          error,
        );
      });
    }
  }

  private async _handleTenantGroupCallbackRefreshFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackRefreshFailure', body);

    const response = await Promise.allSettled([
      this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
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

  private async _handleTenantGroupCallbackDeprovision(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    switch (body.data.status) {
      case 'QUEUED':
      case 'PENDING':
        return this._handleTenantGroupCallbackDeprovisionPending(body, operation);
      case 'WORKING':
        return this._handleTenantGroupCallbackDeprovisionWorking(body, operation);
      case 'SUCCESS':
        return this._handleTenantGroupCallbackDeprovisionSuccess(body, operation);
      case 'FAILURE':
      case 'INTERNAL_ERROR':
      case 'TIMEOUT':
      case 'CANCELLED':
      case 'EXPIRED':
        return this._handleTenantGroupCallbackDeprovisionFailure(body, operation);
      default:
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackDeprovision: Unsupported status',
          body,
        );
        break;
    }

    return;
  }

  private async _handleTenantGroupCallbackDeprovisionPending(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionPending', body);
    await this._operationsRepository.updateStatus(operation.id, 'pending', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackDeprovisionWorking(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionWorking', body);
    await this._operationsRepository.updateStatus(operation.id, 'in-progress', { buildId: body.data.id });
    return;
  }

  private async _handleTenantGroupCallbackDeprovisionSuccess(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    try {
      this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionSuccess', body);

      const response = await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'completed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'deprovisioned';
          return tg;
        }),
      ]);

      if (response.some((r) => r.status === 'rejected')) {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionSuccess: Failed to update operation or tenant group',
          body,
          response,
        );
      }
      return;
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionSuccess', error);
      await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'deprovisioning-failed';
          return tg;
        }),
      ]).catch((error) => {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionSuccess: Failed to update operation or tenant group',
          body,
          error,
        );
      });
    }
  }

  private async _handleTenantGroupCallbackDeprovisionFailure(
    body: CloudBuildOperationsCallbackBodySchemaType,
    operation: OperationSchemaType,
  ): Promise<void> {
    try {
      this._opts.logger.info('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionFailure', body);

      const response = await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'deprovisioning-failed';
          return tg;
        }),
      ]);

      if (response.some((r) => r.status === 'rejected')) {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionFailure: Failed to update operation or tenant group',
          body,
          response,
        );
      }
      return;
    } catch (error) {
      this._opts.logger.error('CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionFailure', error);
      await Promise.allSettled([
        this._operationsRepository.updateStatus(operation.id, 'failed', { buildId: body.data.id }),
        this._tenantGroupRepository.runTransaction<TenantGroupSchemaType>(operation.resourceId, async (tg) => {
          tg.status = 'deprovisioning-failed';
          return tg;
        }),
      ]).catch((error) => {
        this._opts.logger.error(
          'CloudBuildOperationCallback._handleTenantGroupCallbackDeprovisionSuccess: Failed to update operation or tenant group',
          body,
          error,
        );
      });
    }
  }
}
