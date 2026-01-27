import assert from 'assert';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { JwtPayload, decode } from 'jsonwebtoken';
import logger from '../logger';
import { Cluster } from '../types';

export const discoverBYOAClusters = async (): Promise<{ clusters: Cluster[] }> => {
  logger.info('Discovering BYOA clusters from Omnistrate...');

  const clusters = await getClusters();

  return { clusters };
};

async function getClusters(): Promise<Cluster[]> {
  const omnistrateUser = process.env.OMNISTRATE_USER;
  const omnistratePassword = process.env.OMNISTRATE_PASSWORD;
  const omnistrateServiceId = process.env.OMNISTRATE_SERVICE_ID;
  const omnistrateEnvironmentId = process.env.OMNISTRATE_ENVIRONMENT_ID;
  const omnistrateByocProductTierId = process.env.OMNISTRATE_BYOC_PRODUCT_TIER_ID;

  if (!omnistrateUser || !omnistratePassword) {
    logger.warn('Omnistrate credentials are not set. Skipping BYOA cluster discovery.');
    return [];
  }
  if (!omnistrateServiceId || !omnistrateEnvironmentId || !omnistrateByocProductTierId) {
    logger.warn('Omnistrate service/environment/BYOC product tier ID are not set. Skipping BYOA cluster discovery.');
    return [];
  }

  const omnistrateClient = new OmnistrateClient(
    omnistrateUser,
    omnistratePassword,
    omnistrateServiceId,
    omnistrateEnvironmentId,
    omnistrateByocProductTierId,
  );

  const deploymentCells = await omnistrateClient.getDeploymentCells(
    'BYOA',
    'RUNNING',
    process.env.OMNISTRATE_AWS_INTERMEDIARY_ACCOUNT_ID,
  );

  const byocCloudAccounts = await omnistrateClient.getBYOCCloudAccounts();

  const clusters: Cluster[] = [];

  for await (const cell of deploymentCells) {
    try {
      const credentials = await omnistrateClient.getDeploymentCellCredentials(cell.id);
      const clusterName = cell.cloudProvider === 'gcp' ? `c-${cell.id.replace(/-/g, '')}` : cell.id;
      const account = byocCloudAccounts.find(
        (account) =>
          account.cloudProvider === cell.cloudProvider && account.cloudAccountId === cell.destinationAccountID,
      );
      clusters.push({
        name: clusterName,
        cloud: cell.cloudProvider,
        region: cell.region,
        endpoint: credentials.apiServerEndpoint,
        destinationAccountID: cell.destinationAccountID,
        secretConfig: {
          tlsClientConfig: {
            insecure: false,
            caData: credentials.caDataBase64,
          },
          clientCertificateData: credentials.clientCertificateDataBase64,
          clientKeyData: credentials.clientKeyDataBase64,
          serviceAccountToken: credentials.serviceAccountToken,
        },
        hostMode: 'byoa',
        destinationAccountNumber: account?.cloudAccountNumber,
        organizationId: account?.organizationId,
      });
      logger.info(`Discovered BYOA cluster ${cell.id} in region ${cell.region}`);
    } catch (error) {
      logger.error({ error, cellId: cell.id }, 'Failed to get credentials for BYOA deployment cell');
    }
  }
  logger.info({ clusterCount: clusters.length }, `Found ${clusters.length} BYOA clusters.`);
  return clusters;
}

export class OmnistrateClient {
  private static _client: AxiosInstance;

  private static _token: string | null = null;

  private static _baseUrl: string = 'https://api.omnistrate.cloud';

  constructor(
    _omnistrateUser: string,
    _omnistratePassword: string,
    private omnistrateServiceId?: string,
    private omnistrateEnvironmentId?: string,
    private omnistrateByocProductTierId?: string,
  ) {
    OmnistrateClient._client = axios.create({
      baseURL: OmnistrateClient._baseUrl,
    });
    assert(_omnistrateUser, 'OmnistrateClient: Omnistrate user is required');
    assert(_omnistratePassword, 'OmnistrateClient: Omnistrate password is required');
    assert(omnistrateServiceId, 'OmnistrateClient: Omnistrate service ID is required');
    assert(omnistrateEnvironmentId, 'OmnistrateClient: Omnistrate environment ID is required');
    assert(omnistrateByocProductTierId, 'OmnistrateClient: Omnistrate BYOC product tier ID is required');
    OmnistrateClient._client.interceptors.request.use(
      OmnistrateClient._getBearerInterceptor(_omnistrateUser, _omnistratePassword),
    );
  }

  static _getBearerInterceptor(
    user: string,
    password: string,
  ): (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> {
    return async (config: InternalAxiosRequestConfig) => {
      try {
        if (OmnistrateClient._token && (decode(OmnistrateClient._token) as JwtPayload).exp * 1000 < Date.now()) {
          config.headers.Authorization = `Bearer ${OmnistrateClient._token}`;
          return config;
        }
      } catch (_) {
        //
      }
      const bearer = await OmnistrateClient._getBearer(user, password);
      config.headers.Authorization = `Bearer ${bearer}`;
      return config;
    };
  }

  static async _getBearer(email: string, password: string): Promise<string> {
    const response = await axios.post(`${OmnistrateClient._baseUrl}/2022-09-01-00/signin`, {
      email,
      password,
    });
    return response.data.jwtToken;
  }

  async getDeploymentCells(
    modelType?: 'CUSTOMER_HOSTED' | 'BYOA',
    status?: 'RUNNING',
    intermediaryAccountId?: string,
  ): Promise<
    {
      cloudProvider: 'gcp' | 'aws' | 'azure';
      region: string;
      id: string;
      status: string;
      modelType: string;
      customer_email?: string;
      intermediaryAccountID?: string;
      destinationAccountID: string;
    }[]
  > {
    const response = await OmnistrateClient._client.get(`/2022-09-01-00/fleet/host-clusters`);
    return (
      response.data.hostClusters?.map((hc: any) => ({
        cloudProvider: hc.cloudProvider,
        region: hc.region,
        id: hc.id,
        status: hc.status,
        modelType: hc.modelType,
        customer_email: hc.customer_email,
        intermediaryAccountID: hc.intermediaryAccountDetail?.intermediaryAccountID,
        destinationAccountID: hc.accountID,
      })) || []
    ).filter(
      (hc: any) =>
        (status ? hc.status === status : true) &&
        (modelType ? hc.modelType === modelType : true) &&
        (intermediaryAccountId ? hc?.intermediaryAccountID === intermediaryAccountId : true),
    );
  }

  async getDeploymentCellCredentials(deploymentCellId: string): Promise<{
    apiServerEndpoint: string;
    caDataBase64: string;
    clientCertificateDataBase64: string;
    clientKeyDataBase64: string;
    id: string;
    serviceAccountToken: string;
    userName: string;
  }> {
    const params = {
      role: 'cluster-admin',
    };
    const response = await OmnistrateClient._client.get(
      `/2022-09-01-00/fleet/host-cluster/${deploymentCellId}/kubeconfig`,
      {
        params,
      },
    );
    const data = response.data;
    return {
      apiServerEndpoint: data.apiServerEndpoint,
      caDataBase64: data.caDataBase64,
      clientCertificateDataBase64: data.clientCertificateDataBase64,
      clientKeyDataBase64: data.clientKeyDataBase64,
      id: data.id,
      serviceAccountToken: data.serviceAccountToken,
      userName: data.userName,
    };
  }

  async getBYOCCloudAccounts(): Promise<
    {
      cloudProvider: 'gcp' | 'aws';
      id: string;
      cloudAccountId: string;
      cloudAccountNumber: string;
      organizationId: string;
    }[]
  > {
    const params = {
      ProductTierId: this.omnistrateByocProductTierId,
      Filter: 'onlyCloudAccounts',
      ExcludeDetail: 'true',
    };
    const response = await OmnistrateClient._client.get(
      `/2022-09-01-00/fleet/service/${this.omnistrateServiceId}/environment/${this.omnistrateEnvironmentId}/instances`,
      {
        params,
      },
    );
    const data = response.data.resourceInstances;
    return data.map((d) => ({
      cloudProvider: d.cloudProvider,
      id: d.input_params.cloud_provider_account_config_id,
      cloudAccountId: d.input_params.gcp_project_id ?? d.input_params.aws_account_id,
      cloudAccountNumber: d.input_params.gcp_project_number ?? d.input_params.aws_account_id,
      organizationId: d.organizationId,
    }));
  }
}
