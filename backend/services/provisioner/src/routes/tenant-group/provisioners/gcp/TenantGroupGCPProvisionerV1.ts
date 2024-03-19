import { ApiError } from '@falkordb/errors';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { TenantGroupGCPProvisioner } from './TenantGroupGCPProvisioner';
import { TenantGroupSchemaType } from '@falkordb/schemas/dist/global/tenantGroup';
import { CloudProvisionGCPConfigSchemaType, OperationProviderSchemaType, SupportedRegionsSchemaType } from '@falkordb/schemas/dist/global';


export class TenantGroupGCPProvisionerV1 implements TenantGroupGCPProvisioner {
  _cloudbuild = new CloudBuildClient();
  
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

  private _getTenantGroupInfraVars = (
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

  private _getTenantGroupK8sVars = (
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): string[] => {
    return [
      `-var=project_id=${cloudProvisionConfig.cloudProviderConfig.deploymentProjectId}`,
      `-var=region=${region}`,
      `-var=tenant_provision_sa=${cloudProvisionConfig.cloudProviderConfig.deploymentProvisionServiceAccount}`,
      `-var=cluster_backup_schedule=${cloudProvisionConfig.tenantGroupConfig.clusterBackupSchedule}`,
      `-var=cluster_name=$TF_VAR_cluster_name`,
      `-var=cluster_endpoint=$TF_VAR_cluster_endpoint`,
      `-var=cluster_ca_certificate=$TF_VAR_cluster_ca_certificate`,
      `-var=backup_bucket_name=$TF_VAR_backup_bucket_name`,
      `-var=velero_gcp_sa_id=$TF_VAR_velero_gcp_sa_id`,
      `-var=velero_gcp_sa_email=$TF_VAR_velero_gcp_sa_email`,
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
    const initPlanApplySteps = (folder: 'infra' | 'k8s') => {
      const tofuVars =
        folder === 'infra'
          ? this._getTenantGroupInfraVars(tenantGroupId, region, cloudProvisionConfig).join(' ')
          : this._getTenantGroupK8sVars(region, cloudProvisionConfig).join(' ');

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

          script:
            folder === 'infra'
              ? `set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1`
              : `        
          apk add jq
          TF_VAR_cluster_name=$(cat ../infra/infra.output.json | jq -r '.cluster_name.value')
          TF_VAR_cluster_endpoint=$(cat ../infra/infra.output.json | jq -r '.cluster_endpoint.value')
          TF_VAR_cluster_ca_certificate=$(cat ../infra/infra.output.json | jq -r '.cluster_ca_certificate.value')
          TF_VAR_backup_bucket_name=$(cat ../infra/infra.output.json | jq -r '.backup_bucket_name.value')
          TF_VAR_velero_gcp_sa_id=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_id.value')
          TF_VAR_velero_gcp_sa_email=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_email.value')
          set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1
          `,
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
          script:
            folder === 'infra'
              ? `set -eo pipefail; tofu apply -auto-approve ${folder}.tfplan -no-color || (tofu destroy -auto-approve ${tofuVars} -no-color; exit 1)`
              : ` 
              apk add jq
              TF_VAR_cluster_name=$(cat ../infra/infra.output.json | jq -r '.cluster_name.value')
              TF_VAR_cluster_endpoint=$(cat ../infra/infra.output.json | jq -r '.cluster_endpoint.value')
              TF_VAR_cluster_ca_certificate=$(cat ../infra/infra.output.json | jq -r '.cluster_ca_certificate.value')
              TF_VAR_backup_bucket_name=$(cat ../infra/infra.output.json | jq -r '.backup_bucket_name.value')
              TF_VAR_velero_gcp_sa_id=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_id.value')
              TF_VAR_velero_gcp_sa_email=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_email.value')
              set -eo pipefail; tofu apply -auto-approve ${folder}.tfplan -no-color || (tofu destroy -auto-approve ${tofuVars} -no-color; cd ../infra && tofu destroy -auto-approve ${tofuVars} -no-color; exit 1)`,
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

    await this._cloudbuild.createBuild({
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
    tenantGroup: TenantGroupSchemaType,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
  }> {
    const initDestroySteps = (folder: 'infra' | 'k8s') => {
      if (folder === 'k8s' && !tenantGroup.clusterName) return [];

      const tofuVars =
        folder === 'infra'
          ? this._getTenantGroupInfraVars(tenantGroup.id, region, cloudProvisionConfig).join(' ')
          : this._getTenantGroupK8sVars(region, cloudProvisionConfig).join(' ');

      return [
        {
          id: `${folder} - Init Tofu`,
          name: 'oowy/opentofu',
          entrypoint: 'tofu',
          dir: `${folder}`,
          args: [
            'init',
            `-backend-config=bucket=${cloudProvisionConfig.cloudProviderConfig.stateBucket}`,
            `-backend-config=prefix=tenant-group/${folder}/${tenantGroup.id}`,
            '-no-color',
          ],
        },
        {
          id: `${folder} - Destroy Tofu`,
          name: 'falkordb/gcloud-kubectl-falkordb-tofu',
          dir: `${folder}`,
          script:
            folder === 'infra'
              ? `set -eo pipefail; tofu destroy -auto-approve ${tofuVars} -no-color || exit 1`
              : ` 
              apk add jq
              TF_VAR_cluster_name=${tenantGroup.clusterName}
              TF_VAR_cluster_endpoint=${tenantGroup.clusterEndpoint}
              TF_VAR_cluster_ca_certificate=${tenantGroup.clusterCaCertificate}
              TF_VAR_backup_bucket_name=${tenantGroup.backupBucketName}
              TF_VAR_velero_gcp_sa_id=${tenantGroup.veleroGcpSaId}
              TF_VAR_velero_gcp_sa_email=${tenantGroup.veleroGcpSaEmail}
              set -eo pipefail; tofu destroy -auto-approve ${tofuVars} -no-color || exit 1
          `,
        },
      ];
    };
    await this._cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: this._getTags(tenantGroup.id, operationId, 'deprovision'),
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
    const initPlanApplySteps = (folder: 'infra' | 'k8s') => {
      const tofuVars =
        folder === 'infra'
          ? this._getTenantGroupInfraVars(tenantGroupId, region, cloudProvisionConfig).join(' ')
          : this._getTenantGroupK8sVars(region, cloudProvisionConfig).join(' ');

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
          script:
            folder === 'infra'
              ? `set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1`
              : `        
          apk add jq
          TF_VAR_cluster_name=$(cat ../infra/infra.output.json | jq -r '.cluster_name.value')
          TF_VAR_cluster_endpoint=$(cat ../infra/infra.output.json | jq -r '.cluster_endpoint.value')
          TF_VAR_cluster_ca_certificate=$(cat ../infra/infra.output.json | jq -r '.cluster_ca_certificate.value')
          TF_VAR_backup_bucket_name=$(cat ../infra/infra.output.json | jq -r '.backup_bucket_name.value')
          TF_VAR_velero_gcp_sa_id=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_id.value')
          TF_VAR_velero_gcp_sa_email=$(cat ../infra/infra.output.json | jq -r '.velero_gcp_sa_email.value')
          set -eo pipefail; tofu plan ${tofuVars} -out=${folder}.tfplan -no-color || exit 1
          `,
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

    await this._cloudbuild.createBuild({
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
