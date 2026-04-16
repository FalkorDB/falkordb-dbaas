import { Client, IClientOpts } from './client';

export enum ApiVersions {
  V1 = 'v1',
}

export interface IFalkorDBOpts {
  client?: {
    url?: string;
  };
  injectContext?: boolean;
}

export const FalkorDBClient = (opts?: IFalkorDBOpts) => {
  const defaultClient = new Client({
    url: opts?.client?.url ?? 'http://localhost:3000',
  });

  return {
    defaultClient,

    setHeaders(headers: object) {
      defaultClient.setHeaders(headers);
    },
  };
};

export type FalkorDBClient = ReturnType<typeof FalkorDBClient>;
