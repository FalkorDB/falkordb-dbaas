import { LdapRepository } from '../../src/repositories/ldap/LdapRepository';
import pino from 'pino';

describe('LdapRepository', () => {
  let repository: LdapRepository;
  let logger: pino.Logger;

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new LdapRepository({ logger });
  });

  describe('listUsers', () => {
    it('should throw error when localPort is not provided', async () => {
      await expect(repository.listUsers(0, 'org-123', 'token-123', 'ca-cert')).rejects.toThrow();
    });

    // Add integration tests with real LDAP server
  });

  describe('createUser', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(
        repository.createUser(0, 'org-123', 'token-123', 'ca-cert', { username: 'test', password: 'pass', acl: 'acl' }),
      ).rejects.toThrow();

      await expect(
        repository.createUser(8080, 'org-123', 'token-123', 'ca-cert', { username: '', password: 'pass', acl: 'acl' }),
      ).rejects.toThrow();

      await expect(
        repository.createUser(8080, 'org-123', 'token-123', 'ca-cert', { username: 'test', password: '', acl: 'acl' }),
      ).rejects.toThrow();

      await expect(
        repository.createUser(8080, 'org-123', 'token-123', 'ca-cert', { username: 'test', password: 'pass', acl: '' }),
      ).rejects.toThrow();
    });

    // Add integration tests with real LDAP server
  });

  describe('modifyUser', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(repository.modifyUser(0, 'org-123', 'token-123', 'ca-cert', 'user', { password: 'pass' })).rejects.toThrow();
      await expect(repository.modifyUser(8080, 'org-123', 'token-123', 'ca-cert', '', { password: 'pass' })).rejects.toThrow();
    });

    // Add integration tests with real LDAP server
  });

  describe('deleteUser', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(repository.deleteUser(0, 'org-123', 'token-123', 'ca-cert', 'user')).rejects.toThrow();
      await expect(repository.deleteUser(8080, 'org-123', 'token-123', 'ca-cert', '')).rejects.toThrow();
    });

    // Add integration tests with real LDAP server
  });

  describe('getPodName', () => {
    it('should throw error when no LDAP pod is found', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          listNamespacedPod: jest.fn().mockResolvedValue({
            body: {
              items: [],
            },
          }),
        }),
      };

      await expect(repository.getPodName(mockConfig as any, 'ldap-auth')).rejects.toThrow(
        'LDAP pod not found',
      );
    });

    it('should return pod name when LDAP pod is found', async () => {
      const mockConfig = {
        makeApiClient: jest.fn().mockReturnValue({
          listNamespacedPod: jest.fn().mockResolvedValue({
            body: {
              items: [
                {
                  metadata: {
                    name: 'ldap-auth-rs-12345',
                  },
                },
              ],
            },
          }),
        }),
      };

      const podName = await repository.getPodName(mockConfig as any, 'ldap-auth');
      expect(podName).toBe('ldap-auth-rs-12345');
    });
  });
});
