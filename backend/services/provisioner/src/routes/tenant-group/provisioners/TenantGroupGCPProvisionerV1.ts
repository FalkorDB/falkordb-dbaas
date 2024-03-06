import { ApiError } from '@falkordb/errors';
import { CloudProvisionGCPConfigSchemaType } from '../../../schemas/cloudProvision';
import { SupportedRegionsSchemaType } from '../../../schemas/global';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { TenantGroupGCPProvisioner } from './TenantGroupGCPProvisioner';

const cloudbuild = new CloudBuildClient();

export class TenantGroupGCPProvisionerV1 implements TenantGroupGCPProvisioner {
  private _getTags = (
    tenantGroupId: string,
    operationId: string,
    action: 'provision' | 'refresh' | 'deprovision',
  ): string[] => {
    return ['resource-tenant-group', `resourceId-${tenantGroupId}`, `action-${action}`, `operationId-${operationId}`];
  };

  private _lookupSubnetCidr = (
    region: SupportedRegionsSchemaType,
  ): {
    main: string;
    pods: string;
    services: string;
  } => {
    switch (region) {
      case 'me-west1':
        return {
          main: '10.208.0.0/20',
          pods: '10.130.0.0/20',
          services: '10.131.0.0/24',
        };
      default:
        throw ApiError.unprocessableEntity('Region not supported', 'REGION_NOT_SUPPORTED');
    }
  };

  private _getTenantGroupVars = (
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): string[] => {
    const cidr = this._lookupSubnetCidr(region);
    return [
      `-var=project_id=${cloudProvisionConfig.cloudProviderConfig.deploymentProjectId}`,
      `-var=tenant_group_name=${tenantGroupId}`,
      `-var=region=${region}`,
      `-var=tenant_provision_sa=${cloudProvisionConfig.cloudProviderConfig.deploymentProvisionServiceAccount}`,
      `-var=subnet_cidr=${cidr.main}`,
      `-var=ip_range_pods=${cidr.pods}`,
      `-var=ip_range_services=${cidr.services}`,
      `-var=force_destroy_backup_bucket=${cloudProvisionConfig.tenantGroupConfig.forceDestroyBackupBucket}`,
      `-var=dns_domain=${cloudProvisionConfig.tenantGroupConfig.dnsDomain}`,
      `-var=cluster_deletion_protection=${cloudProvisionConfig.tenantGroupConfig.clusterDeletionProtection}`,
      `-var=velero_role_id=${cloudProvisionConfig.tenantGroupConfig.veleroRoleId}`,
    ];
  };

  async provision(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tofuVars = this._getTenantGroupVars(tenantGroupId, region, cloudProvisionConfig).join(' ');

    const initPlanApplySteps = (folder: 'infra' | 'k8s') => {
      return [
        {
          id: `${folder} - Init Tofu`,
          name: 'oowy/opentofu',
          entrypoint: 'tofu',
          dir: `${folder}`,
          args: [
            'init',
            `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
            `-backend-config=prefix=tenant-group/${folder}/${tenantGroupId}`,
            '-no-color',
          ],
        },
        {
          id: `${folder} - Plan Tofu`,
          name: 'oowy/opentofu',
          dir: '${folder}',
          script: `set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1`,
        },
        // Push plan to storage
        {
          id: `${folder} - Push Tofu Plan`,
          name: 'gcr.io/cloud-builders/gsutil',
          entrypoint: 'gsutil',
          dir: `${folder}`,
          args: [
            'cp',
            '${folder}.tfplan',
            `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/${folder}.tfplan`,
          ],
        },
        {
          id: `${folder} - Apply Tofu Plan`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script:
            folder === 'infra'
              ? `set -eo pipefail; tofu apply -auto-approve ${folder}.tfplan -no-color || (tofu destroy -auto-approve ${tofuVars} -no-color; exit 1)`
              : `set -eo pipefail; tofu apply -auto-approve ${folder}.tfplan -no-color || (tofu destroy -auto-approve ${tofuVars} -no-color; cd ../infra && tofu destroy -auto-approve ${tofuVars} -no-color; exit 1)`,
        },
        {
          id: `${folder} - Save output json`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script: `tofu output -json > ${folder}.output.json`,
        },
        {
          id: `${folder} - Copy output to storage`,
          name: 'gcr.io/cloud-builders/gsutil',
          entrypoint: 'gsutil',
          dir: `${folder}`,
          args: [
            'cp',
            `${folder}.output.json`,
            `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/${folder}.output.json`,
          ],
        },
      ];
    };

    await cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenantGroupId, operationId, 'provision'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantGroupConfig.source.url,
            dir: cloudProvisionConfig.tenantGroupConfig.source.dir,
            revision: cloudProvisionConfig.tenantGroupConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          ...initPlanApplySteps('infra'),
          ...initPlanApplySteps('k8s'),
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }

  async deprovision(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tofuVars = this._getTenantGroupVars(tenantGroupId, region, cloudProvisionConfig).join(' ');

    const initDestroySteps = (folder: 'infra' | 'k8s') => {
      return [
        {
          id: '${folder} - Init Tofu',
          name: 'oowy/opentofu',
          entrypoint: 'tofu',
          dir: `${folder}`,
          args: [
            'init',
            `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
            `-backend-config=prefix=tenant-group/${folder}/${tenantGroupId}`,
            '-no-color',
          ],
        },
        {
          id: `${folder} - Destroy Tofu`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script: `set -eo pipefail; tofu destroy -auto-approve ${tofuVars} -no-color || exit 1`,
        },
      ];
    };
    await cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenantGroupId, operationId, 'deprovision'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantGroupConfig.source.url,
            dir: cloudProvisionConfig.tenantGroupConfig.source.dir,
            revision: cloudProvisionConfig.tenantGroupConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          ...initDestroySteps('k8s'),
          ...initDestroySteps('infra'),
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }

  async refresh(
    operationId: string,
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const tofuVars = this._getTenantGroupVars(tenantGroupId, region, cloudProvisionConfig).join(' ');

    const initPlanApplySteps = (folder: 'infra' | 'k8s') => {
      return [
        {
          id: `${folder} - Init Tofu`,
          name: 'oowy/opentofu',
          entrypoint: 'tofu',
          dir: `${folder}`,
          args: [
            'init',
            `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
            `-backend-config=prefix=tenant-group/${folder}/${tenantGroupId}`,
            '-no-color',
          ],
        },
        {
          id: `${folder} - Plan Tofu`,
          name: 'oowy/opentofu',
          dir: `${folder}`,
          script: `set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1`,
        },
        // Push plan to storage
        {
          id: `${folder} - Push Tofu Plan`,
          name: 'gcr.io/cloud-builders/gsutil',
          entrypoint: 'gsutil',
          dir: `${folder}`,
          args: [
            'cp',
            `${folder}.tfplan`,
            `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/${folder}.tfplan`,
          ],
        },
        {
          id: `${folder} - Apply Tofu Plan`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script: `set -eo pipefail; tofu apply -auto-approve ${folder}.tfplan -no-color
`,
        },
        {
          id: `${folder} - Save output json`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script: `tofu output -json > ${folder}.output.json`,
        },
        {
          id: `${folder} - Copy output to storage`,
          name: 'gcr.io/cloud-builders/gsutil',
          entrypoint: 'gsutil',
          dir: `${folder}`,
          args: [
            'cp',
            `${folder}.output.json`,
            `gs://${cloudProvisionConfig.cloudProviderConfig.stateBucket}/builds/$BUILD_ID/${folder}.output.json`,
          ],
        },
      ];
    };

    await cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenantGroupId, operationId, 'refresh'),
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.tenantGroupConfig.source.url,
            dir: cloudProvisionConfig.tenantGroupConfig.source.dir,
            revision: cloudProvisionConfig.tenantGroupConfig.source.revision,
          },
        },
        steps: [
          {
            id: 'Set Permissions',
            name: 'gcr.io/cloud-builders/git',
            entrypoint: 'chmod',
            args: ['-v', '-R', 'a+rw', '.'],
          },
          ...initPlanApplySteps('infra'),
          ...initPlanApplySteps('k8s'),
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
    };
  }
}
