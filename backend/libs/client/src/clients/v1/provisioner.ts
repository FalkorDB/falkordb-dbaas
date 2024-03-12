import { caller } from '../../client';
import {
  TenantProvisionBodySchemaType,
  TenantProvisionHeadersSchemaType,
  TenantProvisionResponseSchemaType,
  TenantDeprovisionResponseSchemaType,
  TenantRefreshResponseSchemaType
} from '@falkordb/schemas/src/services/provisioner/v1';

export const ProvisionerV1 = {
  tenant: {
    provision: (
      headers: TenantProvisionHeadersSchemaType,
      body: TenantProvisionBodySchemaType,
    ): Promise<TenantProvisionResponseSchemaType> => {
      return caller.post('/v1/tenant/provision', body, { headers });
    },

    deprovision: (id: string): Promise<TenantRefreshResponseSchemaType> => {
      return caller.post(`/v1/tenant/${id}/deprovision`, {});
    },

    refresh: (id: string): Promise<TenantDeprovisionResponseSchemaType> => {
      return caller.post(`/v1/tenant/${id}/refresh`, {});
    },
  },
};
