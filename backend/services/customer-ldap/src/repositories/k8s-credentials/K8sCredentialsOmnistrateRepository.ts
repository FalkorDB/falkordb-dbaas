import * as k8s from '@kubernetes/client-node';
import { FastifyBaseLogger } from 'fastify';
import { IK8sCredentialsRepository } from './IK8sCredentialsRepository';
import { OmnistrateClient } from '../omnistrate/OmnistrateClient';
import assert from 'assert';
import { isAxiosError } from 'axios';

interface OmnistrateKubeConfigResponse {
  apiServerEndpoint: string;
  caDataBase64: string;
  clientCertificateDataBase64?: string;
  clientKeyDataBase64?: string;
  id: string;
  serviceAccountToken?: string;
  userName: string;
}

export class K8sCredentialsOmnistrateRepository implements IK8sCredentialsRepository {
  constructor(
    private _omnistrateClient: OmnistrateClient,
    private _options: { logger: FastifyBaseLogger },
  ) {}

  async getKubeConfig(
    cloudProvider: 'gcp' | 'aws' | 'azure',
    clusterId: string,
    region: string,
  ): Promise<k8s.KubeConfig> {
    this._options.logger.info({ cloudProvider, clusterId, region }, 'Getting kubeconfig from Omnistrate');

    assert(clusterId, 'K8sCredentialsRepository: Cluster ID is required');

    // For GCP, clusterId is in format 'c-<hash>', we need to remove the 'c-' prefix and add dashes back
    // For AWS/Azure, use clusterId as-is
    const hostClusterId = cloudProvider === 'gcp' 
      ? this._formatGCPClusterId(clusterId)
      : clusterId;

    let response: OmnistrateKubeConfigResponse;
    try {
      const apiResponse = await this._omnistrateClient.client.get(
        `/2022-09-01-00/fleet/host-cluster/${hostClusterId}/kubeconfig?role=cluster-admin`,
      );
      response = apiResponse.data;
    } catch (error) {
      const sanitizedError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: isAxiosError(error) ? error.response?.status : undefined,
        code: isAxiosError(error) ? error.code : undefined,
      };
      this._options.logger.error({ error: sanitizedError, hostClusterId }, 'Error getting kubeconfig from Omnistrate');
      throw new Error('Failed to retrieve kubeconfig from Omnistrate');
    }

    assert(response.apiServerEndpoint, 'Missing apiServerEndpoint in kubeconfig response');
    assert(response.caDataBase64, 'Missing caDataBase64 in kubeconfig response');
    assert(response.userName, 'Missing userName in kubeconfig response');

    const kubeConfig = new k8s.KubeConfig();
    const server = this._normalizeApiServerEndpoint(response.apiServerEndpoint);

    // Build kubeconfig based on available authentication method
    if (response.serviceAccountToken) {
      // Service account token authentication
      const token = this._decodeBase64ToUtf8(response.serviceAccountToken);
      kubeConfig.loadFromOptions({
        clusters: [
          {
            name: hostClusterId,
            caData: response.caDataBase64,
            server,
          },
        ],
        users: [
          {
            name: response.userName,
            token,
          },
        ],
        contexts: [
          {
            name: hostClusterId,
            cluster: hostClusterId,
            user: response.userName,
          },
        ],
        currentContext: hostClusterId,
      });
    } else if (response.clientCertificateDataBase64 && response.clientKeyDataBase64) {
      // Client certificate authentication
      kubeConfig.loadFromOptions({
        clusters: [
          {
            name: hostClusterId,
            caData: response.caDataBase64,
            server,
          },
        ],
        users: [
          {
            name: response.userName,
            certData: response.clientCertificateDataBase64,
            keyData: response.clientKeyDataBase64,
          },
        ],
        contexts: [
          {
            name: hostClusterId,
            cluster: hostClusterId,
            user: response.userName,
          },
        ],
        currentContext: hostClusterId,
      });
    } else {
      throw new Error('No valid authentication method found in kubeconfig response');
    }

    this._options.logger.info({ hostClusterId }, 'Successfully created kubeconfig');
    return kubeConfig;
  }

  private _formatGCPClusterId(clusterId: string): string {
    // GCP cluster IDs from getInstance are in format 'c-<hash>' (e.g., 'c-abc123def456')
    // Omnistrate expects the original format with dashes (`hc-123456`)
    // Remove 'c-' prefix and add dashes back in the proper positions
    // This is a heuristic - adjust based on actual GCP cluster ID format
    if (clusterId.startsWith('c-hc')) {
        return `hc-${clusterId.substring(4)}`
    }
    return clusterId;
  }

  private _normalizeApiServerEndpoint(apiServerEndpoint: string): string {
    const trimmed = apiServerEndpoint.trim().replace(/\s+/g, '');
    const withoutDanglingColon = trimmed.endsWith(':') ? trimmed.slice(0, -1) : trimmed;
    const withScheme = /^https?:\/\//i.test(withoutDanglingColon)
      ? withoutDanglingColon
      : `https://${withoutDanglingColon}`;

    try {
      // Ensures it's a valid absolute URL for the k8s client.
      return new URL(withScheme).toString();
    } catch {
      throw new Error(`Invalid apiServerEndpoint in kubeconfig response: ${apiServerEndpoint}`);
    }
  }

  private _decodeBase64ToUtf8(value: string): string {
    // Omnistrate returns the serviceAccountToken base64-encoded.
    return Buffer.from(value, 'base64').toString('utf8').trim();
  }
}
