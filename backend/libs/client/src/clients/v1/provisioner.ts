import { Client } from '../../client';
import {
  TenantProvisionBodySchemaType,
  TenantProvisionHeadersSchemaType,
  TenantProvisionResponseSchemaType,
  TenantDeprovisionResponseSchemaType,
  TenantRefreshResponseSchemaType,
  TenantGroupProvisionBodySchemaType,
  TenantGroupProvisionResponseSchemaType,
  TenantGroupDeprovisionParamsSchemaType,
  TenantGroupRefreshResponseSchemaType,
  TenantGroupRefreshParamsSchemaType,
  TenantRefreshParamsSchemaType,
  TenantDeprovisionParamsSchemaType,
  CloudProvisionConfigCreateBodySchemaType,
  CloudProvisionConfigCreateResponseSuccessSchemaType,
  CloudProvisionConfigListQuerySchemaType,
  CloudProvisionConfigListResponseSchemaType,
  CloudProvisionConfigDeleteParamsSchemaType,
} from '@falkordb/schemas/src/services/provisioner/v1';

export const ProvisionerV1 = (client: Client) => ({
  tenant: {
    provision: (body: TenantProvisionBodySchemaType): Promise<TenantProvisionResponseSchemaType> => {
      return client.post('/tenant/provision', body);
    },

    deprovision: (params: TenantDeprovisionParamsSchemaType): Promise<TenantRefreshResponseSchemaType> => {
      return client.post(`/tenant/${params.id}/deprovision`, {});
    },

    refresh: (params: TenantRefreshParamsSchemaType): Promise<TenantDeprovisionResponseSchemaType> => {
      return client.post(`/tenant/${params.id}/refresh`, {});
    },
  },

  tenantGroup: {
    provision: (body: TenantGroupProvisionBodySchemaType): Promise<TenantGroupProvisionResponseSchemaType> => {
      return client.post('/tenant-group/provision', body);
    },

    deprovision: (params: TenantGroupDeprovisionParamsSchemaType): Promise<TenantGroupDeprovisionParamsSchemaType> => {
      return client.post(`/tenant-group/${params.id}/deprovision`, {});
    },

    refresh: (params: TenantGroupRefreshParamsSchemaType): Promise<TenantGroupRefreshResponseSchemaType> => {
      return client.post(`/tenant-group/${params.id}/refresh`, {});
    },
  },

  cloudProvisionConfig: {
    create: (
      body: CloudProvisionConfigCreateBodySchemaType,
    ): Promise<CloudProvisionConfigCreateResponseSuccessSchemaType> => {
      return client.post('/cloud-provision-config', body);
    },

    list: (query: CloudProvisionConfigListQuerySchemaType): Promise<CloudProvisionConfigListResponseSchemaType> => {
      return client.get('/cloud-provision-config', { query });
    },

    delete: (params: CloudProvisionConfigDeleteParamsSchemaType): Promise<void> => {
      return client.delete(`/cloud-provision-config/${params.id}`, {});
    },
  },
});
