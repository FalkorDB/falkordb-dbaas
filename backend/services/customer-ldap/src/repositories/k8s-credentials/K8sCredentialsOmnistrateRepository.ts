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
    const hostClusterId = cloudProvider === 'gcp' ? this._formatGCPClusterId(clusterId) : clusterId;

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
    this._options.logger.debug({ hostClusterId, server }, 'Normalizing kubeconfig response from Omnistrate');

    const caData = this._ensureBase64PemOrBase64(response.caDataBase64);
    const hasClientCert = Boolean(response.clientCertificateDataBase64 && response.clientKeyDataBase64);
    const hasToken = Boolean(response.serviceAccountToken);

    if (!hasClientCert && !hasToken) {
      throw new Error('No valid authentication method found in kubeconfig response');
    }

    const user: { name: string; token?: string; certData?: string; keyData?: string } = {
      name: response.userName,
    };

    // Add client cert/key if present (required for clusters with mTLS-only API endpoints).
    if (hasClientCert) {
      user.certData = this._ensureBase64PemOrBase64(response.clientCertificateDataBase64!);
      user.keyData = this._ensureBase64PemOrBase64(response.clientKeyDataBase64!);
    }

    // Add bearer token if present (required for RBAC in many clusters).
    if (hasToken) {
      user.token = this._normalizeServiceAccountToken(response.serviceAccountToken!);
    }

    this._options.logger.info(
      { hostClusterId, hasToken, hasClientCert },
      'Building kubeconfig from Omnistrate response',
    );

    kubeConfig.loadFromOptions({
      clusters: [
        {
          name: hostClusterId,
          caData,
          server,
        },
      ],
      users: [user],
      contexts: [
        {
          name: hostClusterId,
          cluster: hostClusterId,
          user: response.userName,
        },
      ],
      currentContext: hostClusterId,
    });

    this._options.logger.info({ hostClusterId }, 'Successfully created kubeconfig');
    return kubeConfig;
  }

  private _formatGCPClusterId(clusterId: string): string {
    // GCP cluster IDs from getInstance are in format 'c-<hash>' (e.g., 'c-abc123def456')
    // Omnistrate expects the original format with dashes (`hc-123456`)
    // Remove 'c-' prefix and add dashes back in the proper positions
    // This is a heuristic - adjust based on actual GCP cluster ID format
    if (clusterId.startsWith('c-hc')) {
      return `hc-${clusterId.substring(4)}`;
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
      const _ = new URL(withScheme).toString();
      return withScheme;
    } catch {
      throw new Error(`Invalid apiServerEndpoint in kubeconfig response: ${apiServerEndpoint}`);
    }
  }

  private _normalizeServiceAccountToken(value: string): string {
    // Tokens must not contain whitespace/newlines/control chars; otherwise Node will reject
    // them as invalid header values for the k8s client requests.
    const compactInput = value.replace(/\s+/g, '');
    const rawCandidate = compactInput;
    const decodedCandidate = this._tryDecodeBase64ToUtf8(compactInput);

    const rawOk = this._isSafeHeaderValue(rawCandidate);
    const decodedOk = decodedCandidate !== undefined && this._isSafeHeaderValue(decodedCandidate);

    // Prefer an already-raw JWT-like token (some environments may return the token not-base64).
    if (rawOk && this._isJwtLike(rawCandidate)) {
      return rawCandidate;
    }

    // Prefer decoded token if it looks like a JWT (expected Omnistrate behavior) OR if raw isn't safe.
    if (decodedOk && (this._isJwtLike(decodedCandidate!) || !rawOk)) {
      return decodedCandidate!;
    }

    if (rawOk) {
      return rawCandidate;
    }

    if (decodedOk) {
      return decodedCandidate!;
    }

    throw new Error('Invalid serviceAccountToken in kubeconfig response');
  }

  private _tryDecodeBase64ToUtf8(value: string): string | undefined {
    // Some Omnistrate responses base64-encode the token, sometimes with newlines.
    // We only accept the decoded value if it's header-safe.
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      const compactDecoded = decoded.replace(/\s+/g, '');
      return compactDecoded.length > 0 ? compactDecoded : undefined;
    } catch {
      return undefined;
    }
  }

  private _isSafeHeaderValue(value: string): boolean {
    if (!value) {
      return false;
    }

    // Reject any control characters (includes \r/\n) and any remaining whitespace.
    if (/[\u0000-\u001F\u007F\s]/.test(value)) {
      return false;
    }

    // Be conservative: only allow visible ASCII (common for bearer tokens).
    return /^[\x21-\x7E]+$/.test(value);
  }

  private _isJwtLike(value: string): boolean {
    const parts = value.split('.');
    if (parts.length !== 3) {
      return false;
    }
    return parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p) && p.length > 0);
  }

  private _ensureBase64PemOrBase64(value: string): string {
    // client-node ALWAYS treats caData/certData/keyData as base64 and decodes it.
    // Omnistrate may provide either base64 or PEM; normalize to base64.
    const trimmed = value.trim();
    const looksPem = trimmed.includes('-----BEGIN ');

    if (looksPem) {
      return Buffer.from(trimmed, 'utf8').toString('base64');
    }

    // Assume it's base64 (possibly with newlines) and compact it.
    return trimmed.replace(/\s+/g, '');
  }
}
