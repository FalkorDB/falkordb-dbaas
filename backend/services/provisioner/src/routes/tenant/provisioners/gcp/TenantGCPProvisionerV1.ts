import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { TenantGCPProvisioner } from './TenantGCPProvisioner';
import { TenantGroupSchemaType } from '@falkordb/schemas/global';
import { TenantProvisionBodySchemaType } from '@falkordb/schemas/services/provisioner/v1';
import { CloudProvisionGCPConfigSchemaType, OperationProviderSchemaType, TenantSchemaType } from '@falkordb/schemas/global';

export class TenantGCPProvisionerV1 implements TenantGCPProvisioner {
  private _cloudbuild = new CloudBuildClient();

  private _getTags = (
    tenantId: string,
    operationId: string,
    action: 'provision' | 'refresh' | 'deprovision',
  ): string[] => {
    return ['resource-tenant', `resourceId-${tenantId}`, `action-${action}`, `operationId-${operationId}`];
  };

  private _getTenantPorts = (tenantIdx: number) => {
    const initial = 30000;
    const block = 5;
    return {
      redis: initial + block * tenantIdx,
      redisReadOnly: initial + block * tenantIdx + 1,
      sentinel: initial + block * tenantIdx + 2,
    };
  };

  private _getTenantVars = (
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    params: Omit<TenantProvisionBodySchemaType, 'clusterDeploymentVersion'>,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): string[] => {
    const ports = this._getTenantPorts(tenantIdx);
    return [
      `-var=region=${tenantGroup.region}`,
      `-var=tenant_name=${tenantId}`,
      `-var=vpc_name=${tenantGroup.vpcName}`,
      `-var=cluster_endpoint=${tenantGroup.clusterEndpoint}`,
      `-var=cluster_ca_certificate=${tenantGroup.clusterCaCertificate}`,
      `-var=cluster_name=${tenantGroup.clusterName}`,
      `-var=ip_address=${tenantGroup.ipAddress}`,
      `-var=backup_bucket_name=${tenantGroup.backupBucketName}`,
      `-var=dns_domain=${tenantGroup.clusterDomain}`,
      //
      `-var=node_pool_name=tier-${params.tierId}`,
      `-var=falkordb_replication_configuration='{"enable": ${params.replicationConfiguration.enabled}, "multi_zone": ${params.replicationConfiguration.multiZone}}'`,
      `-var=falkordb_replicas=${params.replicationConfiguration.replicas}`,
      `-var=backup_schedule="${params.backupSchedule}"`,
      //
      `-var=project_id=${cloudProvisionConfig.cloudProviderConfig.deploymentProjectId}`,
      `-var=falkordb_version=${cloudProvisionConfig.tenantConfig.falkordbVersion}`,
      //
      `-var=falkordb_cpu=${cloudProvisionConfig.tenantConfig.tiers[params.tierId].falkordbCpu}`,
      `-var=falkordb_min_cpu=${cloudProvisionConfig.tenantConfig.tiers[params.tierId].falkordbMinCpu}`,
      `-var=falkordb_memory=${cloudProvisionConfig.tenantConfig.tiers[params.tierId].falkordbMemory}`,
      `-var=falkordb_min_memory=${cloudProvisionConfig.tenantConfig.tiers[params.tierId].falkordbMinMemory}`,
      `-var=persistence_size=${cloudProvisionConfig.tenantConfig.tiers[params.tierId].persistenceSize}`,
      `-var=falkordb_password=null`,
      //
      `-var=redis_port=${ports.redis}`,
      `-var=redis_read_only_port=${ports.redisReadOnly}`,
      `-var=sentinel_port=${ports.sentinel}`,
    ];
  };

  async provision(
    operationId: string,
    tenantId: string,
    tenantIdx: number,
    tenantGroup: TenantGroupSchemaType,
    params: TenantProvisionBodySchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tofuVars = this._getTenantVars(tenantId, tenantIdx, tenantGroup, params, cloudProvisionConfig).join(' ');

    await this._cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenantId, operationId, 'provision'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantConfig.source.url,
            dir: cloudProvisionConfig.tenantConfig.source.dir,
            revision: cloudProvisionConfig.tenantConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          {
            id: 'Init Tofu',
            name: 'oowy/opentofu',
            entrypoint: 'tofu',
            args: [
              'init',
              `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
              `-backend-config=prefix=tenant/${tenantId}`,
              '-no-color',
            ],
          },
          {
            id: `Plan Tofu`,
            name: 'oowy/opentofu',
            script: `set -eo pipefail; tofu plan ${tofuVars} -out=tfplan -no-color || exit 1`,
          },
          // Push plan to storage
          {
            id: `Push Tofu Plan`,
            name: 'gcr.io/cloud-builders/gsutil',
            entrypoint: 'gsutil',
            args: [
              'cp',
              'tfplan',
              `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/tfplan`,
            ],
          },
          {
            id: `Apply Tofu Plan`,
            name: 'falkordb/gcloud-kubectl-falkordb-tofu',
            script: `set -eo pipefail; tofu apply -auto-approve tfplan -no-color || (tofu destroy -auto-approve ${tofuVars} -no-color; exit 1)
`,
          },
          {
            id: `Save output json`,
            name: 'falkordb/gcloud-kubectl-falkordb-tofu',
            script: `tofu output -json > output.json`,
          },
          {
            id: 'Copy output to storage',
            name: 'gcr.io/cloud-builders/gsutil',
            entrypoint: 'gsutil',
            args: [
              'cp',
              'output.json',
              `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/output.json`,
            ],
          },
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }

  async deprovision(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tenantIdx = tenantGroup.tenants.find((t) => t.id === tenant.id).position;
    const tofuVars = this._getTenantVars(
      tenant.id,
      tenantIdx,
      tenantGroup,
      {
        backupSchedule: tenant.backupSchedule,
        cloudProvider: tenant.cloudProvider,
        name: tenant.name,
        region: tenant.region,
        replicationConfiguration: tenant.replicationConfiguration,
        tierId: tenant.tierId,
        billingAccountId: tenant.billingAccountId,
      },
      cloudProvisionConfig,
    ).join(' ');

    await this._cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenant.id, operationId, 'deprovision'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantConfig.source.url,
            dir: cloudProvisionConfig.tenantConfig.source.dir,
            revision: cloudProvisionConfig.tenantConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          {
            id: 'Init Tofu',
            name: 'oowy/opentofu',
            entrypoint: 'tofu',
            args: [
              'init',
              `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
              `-backend-config=prefix=tenant/${tenant.id}`,
              '-no-color',
            ],
          },
          {
            id: `Destroy Tofu`,
            name: 'falkordb/gcloud-kubectl-falkordb-tofu',
            script: `set -eo pipefail; tofu destroy -auto-approve ${tofuVars} -no-color || exit 1`,
          },
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }

  async refresh(
    operationId: string,
    tenant: TenantSchemaType,
    tenantGroup: TenantGroupSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tenantIdx = tenantGroup.tenants.find((t) => t.id === tenant.id).position;
    const tofuVars = this._getTenantVars(
      tenant.id,
      tenantIdx,
      tenantGroup,
      {
        backupSchedule: tenant.backupSchedule,
        cloudProvider: tenant.cloudProvider,
        name: tenant.name,
        region: tenant.region,
        replicationConfiguration: tenant.replicationConfiguration,
        tierId: tenant.tierId,
        billingAccountId: tenant.billingAccountId,
      },
      cloudProvisionConfig,
    ).join(' ');

    await this._cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenant.id, operationId, 'refresh'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantConfig.source.url,
            dir: cloudProvisionConfig.tenantConfig.source.dir,
            revision: cloudProvisionConfig.tenantConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          {
            id: 'Init Tofu',
            name: 'oowy/opentofu',
            entrypoint: 'tofu',
            args: [
              'init',
              `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
              `-backend-config=prefix=tenant/${tenant.id}`,
              '-no-color',
            ],
          },
          {
            id: `Plan Tofu`,
            name: 'oowy/opentofu',
            script: `set -eo pipefail; tofu plan ${tofuVars} -out=tfplan -no-color || exit 1`,
          },
          // Push plan to storage
          {
            id: `Push Tofu Plan`,
            name: 'gcr.io/cloud-builders/gsutil',
            entrypoint: 'gsutil',
            args: [
              'cp',
              'tfplan',
              `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/tfplan`,
            ],
          },
          {
            id: `Apply Tofu Plan`,
            name: 'falkordb/gcloud-kubectl-falkordb-tofu',
            script: `set -eo pipefail; tofu apply -auto-approve tfplan -no-color
`,
          },
          {
            id: `Save output json`,
            name: 'falkordb/gcloud-kubectl-falkordb-tofu',
            script: `tofu output -json > output.json`,
          },
          {
            id: 'Copy output to storage',
            name: 'gcr.io/cloud-builders/gsutil',
            entrypoint: 'gsutil',
            args: [
              'cp',
              'output.json',
              `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/output.json`,
            ],
          },
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }
}
