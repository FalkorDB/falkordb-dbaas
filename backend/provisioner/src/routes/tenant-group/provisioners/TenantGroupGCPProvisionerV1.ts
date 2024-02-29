import { ApiError } from '../../../errors/ApiError';
import { CloudProvisionGCPConfigSchemaType } from '../../../schemas/cloudProvision';
import { SupportedRegionsSchemaType } from '../../../schemas/global';
import { OperationProviderSchemaType } from '../../../schemas/operation';
import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { TenantGroupGCPProvisioner } from './TenantGroupGCPProvisioner';

const cloudbuild = new CloudBuildClient();

export class TenantGroupGCPProvisionerV1 implements TenantGroupGCPProvisioner {
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
    ];
  };

  async provision(
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
    operationProviderId: string;
  }> {
    const tofuVars = this._getTenantGroupVars(tenantGroupId, region, cloudProvisionConfig).join(' ');

    const buildResponse = await cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: ['tenant-group', tenantGroupId, `action-provision`],
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.source.url,
            dir: cloudProvisionConfig.source.dir,
            revision: cloudProvisionConfig.source.revision,
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
              `-backend-config=prefix=tenant-group/${tenantGroupId}`,
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
        ],
      },
    });

    return {
      operationProvider: 'cloudbuild',
      operationProviderId: buildResponse[1].name,
    };
  }

  async deprovision(
    tenantGroupId: string,
    region: SupportedRegionsSchemaType,
    cloudProvisionConfig: CloudProvisionGCPConfigSchemaType,
  ): Promise<{
    operationProvider: OperationProviderSchemaType;
    operationProviderId: string;
  }> {
    const tofuVars = this._getTenantGroupVars(tenantGroupId, region, cloudProvisionConfig).join(' ');

    const buildResponse = await cloudbuild.createBuild({
      projectId: cloudProvisionConfig.cloudProviderConfig.runnerProjectId,
      build: {
        options: {
          logging: 'CLOUD_LOGGING_ONLY',
        },
        tags: ['tenant-group', tenantGroupId, `action-deprovision`],
        serviceAccount: cloudProvisionConfig.cloudProviderConfig.runnerServiceAccount,
        timeout: { seconds: cloudProvisionConfig.cloudProviderConfig.timeout || 1800 },
        source: {
          gitSource: {
            url: cloudProvisionConfig.source.url,
            dir: cloudProvisionConfig.source.dir,
            revision: cloudProvisionConfig.source.revision,
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
              `-backend-config=prefix=tenant-group/${tenantGroupId}`,
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
      operationProviderId: buildResponse[1].name,
    };
  }
}
