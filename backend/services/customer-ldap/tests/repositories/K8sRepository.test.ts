import { K8sRepository } from '../../src/repositories/k8s/K8sRepository';
import { ApiError } from '@falkordb/errors';
import pino from 'pino';

describe('K8sRepository', () => {
  let repository: K8sRepository;
  let logger: pino.Logger;

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new K8sRepository({ logger });
  });

  it('constructs', () => {
    expect(repository).toBeInstanceOf(K8sRepository);
  });

  describe('getPodNameByPrefix', () => {
    it('throws when no matching pod exists', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          listNamespacedPod: jest.fn().mockResolvedValue({
            body: { items: [] },
          }),
        }),
      };

      try {
        await repository.getPodNameByPrefix(mockConfig as any, 'ldap-auth', 'ldap-auth-rs');
        fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(404);
        expect((error as ApiError).errorCode).toBe('POD_NOT_FOUND');
      }
    });

    it('returns the first matching pod name', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          listNamespacedPod: jest.fn().mockResolvedValue({
            body: {
              items: [
                { metadata: { name: 'other-123' } },
                { metadata: { name: 'ldap-auth-rs-abc' } },
              ],
            },
          }),
        }),
      };

      await expect(
        repository.getPodNameByPrefix(mockConfig as any, 'ldap-auth', 'ldap-auth-rs'),
      ).resolves.toBe('ldap-auth-rs-abc');
    });
  });

  describe('getSecretValueUtf8', () => {
    it('reads and decodes secret key value', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          readNamespacedSecret: jest.fn().mockResolvedValue({
            body: {
              data: {
                API_BEARER_TOKEN: Buffer.from('token-123', 'utf8').toString('base64'),
              },
            },
          }),
        }),
      };

      await expect(
        repository.getSecretValueUtf8(mockConfig as any, 'ldap-auth', 'ldap-auth-secrets', 'API_BEARER_TOKEN'),
      ).resolves.toBe('token-123');
    });

    it('throws if key missing', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          readNamespacedSecret: jest.fn().mockResolvedValue({
            body: { data: {} },
          }),
        }),
      };

      try {
        await repository.getSecretValueUtf8(mockConfig as any, 'ldap-auth', 'ldap-auth-secrets', 'API_BEARER_TOKEN');
        fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(404);
        expect((error as ApiError).errorCode).toBe('SECRET_KEY_NOT_FOUND');
      }
    });
  });

  describe('createPortForward', () => {
    // Note: createPortForward doesn't validate parameters - it relies on k8s client
    // to throw errors for invalid input. Add integration tests with real k8s clusters
    // to test error handling.
  });
});
