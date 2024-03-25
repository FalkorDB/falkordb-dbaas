import { Client, IClientOpts } from './client';
import { AuthV1 } from './clients/v1/auth';
import { OrganizationsV1 } from './clients/v1/organizations';
import { ProvisionerV1 } from './clients/v1/provisioner';
import { UsersV1 } from './clients/v1/users';

export enum ApiVersions {
  V1 = 'v1',
}

export enum Services {
  Provision = 'provisioner',
  Users = 'users',
  Organizations = 'organizations',
  Auth = 'auth',
}

export interface IFalkorDBOpts {
  client?: {
    url?: string;
    urls?: {
      [key in ApiVersions]: {
        [key in Services]?: string;
      };
    };
  };
  injectContext?: boolean;
}

type ClientMap = {
  [key in ApiVersions]: {
    [key in Services]: Client;
  };
};

function createClients(opts: IFalkorDBOpts) {
  const defaultClient = new Client({
    url: opts?.client?.url ?? 'http://localhost:3000',
  });

  const clientMap: Partial<ClientMap> = {};

  for (const [version, services] of Object.entries(opts?.client?.urls ?? {})) {
    for (const [service, url] of Object.entries(services ?? {})) {
      const client = url ? new Client({ url }) : defaultClient;
      if (!clientMap[version]) {
        clientMap[version] = {};
      }
      clientMap[version]![service] = client;
    }
  }

  return { clientMap: clientMap as ClientMap, defaultClient };
}

export const FalkorDBClient = (opts?: IFalkorDBOpts) => {
  const { clientMap, defaultClient } = createClients(opts);

  return {
    clients: clientMap,
    defaultClient,

    services: {
      v1: {
        provisioner: () => ProvisionerV1(clientMap.v1.provisioner),
        users: () => UsersV1(clientMap.v1.users),
        organizations: () => OrganizationsV1(clientMap.v1.organizations),
        auth: () => AuthV1(clientMap.v1.auth),
      },
    },

    setHeaders(headers: object) {
      defaultClient.setHeaders(headers);
      for (const version of Object.keys(clientMap)) {
        for (const service of Object.keys(clientMap[version])) {
          clientMap[version][service].setHeaders(headers);
        }
      }
    },
  };
};

export type FalkorDBClient = ReturnType<typeof FalkorDBClient>;
