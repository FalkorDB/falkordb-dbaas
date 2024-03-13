import { Client } from './client';
import { ProvisionerV1 } from './clients/v1/provisioner';
import { UsersV1 } from './clients/v1/users';

export interface IFalkorDBOpts {
  url: string;

  injectContext?: boolean;
}

export const FalkorDBClient = (opts?: IFalkorDBOpts) => {
  const client = new Client({
    url: opts?.url,
  });

  return {
    client,
    v1: {
      provisioner: () => ProvisionerV1(client),
      users: () => UsersV1(client),
    },
  };
};

export type FalkorDBClient = ReturnType<typeof FalkorDBClient>;
