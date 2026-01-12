import { UserService } from '../../src/services/UserService';
import { IK8sRepository } from '../../src/repositories/k8s/IK8sRepository';
import { ILdapRepository } from '../../src/repositories/ldap/ILdapRepository';
import { IConnectionCacheRepository } from '../../src/repositories/connection-cache/IConnectionCacheRepository';
import pino from 'pino';

describe('UserService', () => {
  let service: UserService;
  let logger: pino.Logger;
  let mockK8sRepo: jest.Mocked<IK8sRepository>;
  let mockLdapRepo: jest.Mocked<ILdapRepository>;
  let mockConnectionCache: jest.Mocked<IConnectionCacheRepository>;

  beforeEach(() => {
    logger = pino({ level: 'silent' });

    mockK8sRepo = {
      getK8sConfig: jest.fn(),
      createPortForward: jest.fn(),
    };

    mockLdapRepo = {
      listUsers: jest.fn(),
      createUser: jest.fn(),
      modifyUser: jest.fn(),
      deleteUser: jest.fn(),
      getPodName: jest.fn(),
      getBearerToken: jest.fn(),
      getCaCertificate: jest.fn(),
    };

    mockConnectionCache = {
      getConnection: jest.fn(),
      setConnection: jest.fn(),
      removeConnection: jest.fn(),
      clearExpired: jest.fn(),
      validateConnection: jest.fn(),
    };

    service = new UserService({ logger }, mockK8sRepo, mockLdapRepo, mockConnectionCache);
  });

  describe('listUsers', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(service.listUsers('', 'gcp', 'cluster', 'region')).rejects.toThrow();
      await expect(service.listUsers('inst-1', '' as any, 'cluster', 'region')).rejects.toThrow();
      await expect(service.listUsers('inst-1', 'gcp', '', 'region')).rejects.toThrow();
      await expect(service.listUsers('inst-1', 'gcp', 'cluster', '')).rejects.toThrow();
    });

    it('should successfully list users and cache connection', async () => {
      const mockConfig = {} as any;
      const mockCloseFn = jest.fn();
      const mockUsers = [
        { username: 'user1', acl: 'rw' },
        { username: 'user2', acl: 'r' },
      ];

      mockConnectionCache.getConnection.mockReturnValue(null);
      mockK8sRepo.getK8sConfig.mockResolvedValue(mockConfig);
      mockLdapRepo.getPodName.mockResolvedValue('ldap-auth-rs-12345');
      mockK8sRepo.createPortForward.mockResolvedValue({
        localPort: 12345,
        close: mockCloseFn,
      });
      mockLdapRepo.getBearerToken.mockResolvedValue('bearer-token-123');
      mockLdapRepo.getCaCertificate.mockResolvedValue('-----BEGIN CERTIFICATE-----\nca-cert\n-----END CERTIFICATE-----');
      mockLdapRepo.listUsers.mockResolvedValue(mockUsers);

      const result = await service.listUsers('inst-1', 'gcp', 'c-test', 'us-central1');

      expect(result).toEqual(mockUsers);
      expect(mockConnectionCache.getConnection).toHaveBeenCalledWith('inst-1');
      expect(mockK8sRepo.getK8sConfig).toHaveBeenCalledWith('gcp', 'c-test', 'us-central1');
      expect(mockLdapRepo.getPodName).toHaveBeenCalledWith(mockConfig, 'ldap-auth');
      expect(mockK8sRepo.createPortForward).toHaveBeenCalledWith(
        mockConfig,
        'ldap-auth',
        'ldap-auth-rs-12345',
        8080,
      );
      expect(mockLdapRepo.getBearerToken).toHaveBeenCalledWith(mockConfig, 'ldap-auth');
      expect(mockLdapRepo.getCaCertificate).toHaveBeenCalledWith(12345);
      expect(mockLdapRepo.listUsers).toHaveBeenCalled();
      expect(mockConnectionCache.setConnection).toHaveBeenCalled();
      expect(mockCloseFn).not.toHaveBeenCalled();
    });

    it('should reuse cached connection', async () => {
      const mockUsers = [{ username: 'user1', acl: 'rw' }];
      const mockLdapService = {
        listUsers: jest.fn().mockResolvedValue(mockUsers),
        createUser: jest.fn(),
        modifyUser: jest.fn(),
        deleteUser: jest.fn(),
      };
      const cachedConnection = {
        ldapService: mockLdapService as any,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-1',
        localPort: 8080,
      };

      mockConnectionCache.getConnection.mockReturnValue(cachedConnection);
      mockConnectionCache.validateConnection.mockResolvedValue(true);

      const result = await service.listUsers('inst-1', 'gcp', 'c-test', 'us-central1');

      expect(result).toEqual(mockUsers);
      expect(mockConnectionCache.getConnection).toHaveBeenCalledWith('inst-1');
      expect(mockK8sRepo.getK8sConfig).not.toHaveBeenCalled();
      expect(mockLdapService.listUsers).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should throw error when required parameters are missing', async () => {
      const userData = { username: 'test', password: 'pass', acl: 'rw' };

      await expect(service.createUser('', 'gcp', 'cluster', 'region', userData)).rejects.toThrow();
      await expect(service.createUser('inst-1', '' as any, 'cluster', 'region', userData)).rejects.toThrow();
      await expect(service.createUser('inst-1', 'gcp', '', 'region', userData)).rejects.toThrow();
      await expect(service.createUser('inst-1', 'gcp', 'cluster', '', userData)).rejects.toThrow();
      await expect(service.createUser('inst-1', 'gcp', 'cluster', 'region', null as any)).rejects.toThrow();
    });

    it('should successfully create user using cached connection', async () => {
      const userData = { username: 'newuser', password: 'password123', acl: 'rw' };
      const mockLdapService = {
        listUsers: jest.fn(),
        createUser: jest.fn().mockResolvedValue(undefined),
        modifyUser: jest.fn(),
        deleteUser: jest.fn(),
      };
      const cachedConnection = {
        ldapService: mockLdapService as any,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-1',
        localPort: 8080,
      };

      mockConnectionCache.getConnection.mockReturnValue(cachedConnection);
      mockConnectionCache.validateConnection.mockResolvedValue(true);

      await service.createUser('inst-1', 'gcp', 'c-test', 'us-central1', userData);

      expect(mockConnectionCache.getConnection).toHaveBeenCalledWith('inst-1');
      expect(mockLdapService.createUser).toHaveBeenCalledWith(userData);
      expect(mockK8sRepo.getK8sConfig).not.toHaveBeenCalled();
    });
  });

  describe('modifyUser', () => {
    it('should throw error when required parameters are missing', async () => {
      const userData = { password: 'newpass' };

      await expect(
        service.modifyUser('', 'gcp', 'cluster', 'region', 'user', userData),
      ).rejects.toThrow();
      await expect(service.modifyUser('inst-1', '' as any, 'cluster', 'region', 'user', userData)).rejects.toThrow();
      await expect(service.modifyUser('inst-1', 'gcp', '', 'region', 'user', userData)).rejects.toThrow();
      await expect(service.modifyUser('inst-1', 'gcp', 'cluster', '', 'user', userData)).rejects.toThrow();
      await expect(
        service.modifyUser('inst-1', 'gcp', 'cluster', 'region', '', userData),
      ).rejects.toThrow();
      await expect(
        service.modifyUser('inst-1', 'gcp', 'cluster', 'region', 'user', null as any),
      ).rejects.toThrow();
    });

    it('should successfully modify user using cached connection', async () => {
      const userData = { password: 'newpassword', acl: 'r' };
      const mockLdapService = {
        listUsers: jest.fn(),
        createUser: jest.fn(),
        modifyUser: jest.fn().mockResolvedValue(undefined),
        deleteUser: jest.fn(),
      };
      const cachedConnection = {
        ldapService: mockLdapService as any,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-1',
        localPort: 8080,
      };

      mockConnectionCache.getConnection.mockReturnValue(cachedConnection);
      mockConnectionCache.validateConnection.mockResolvedValue(true);

      await service.modifyUser('inst-1', 'gcp', 'c-test', 'us-central1', 'testuser', userData);

      expect(mockConnectionCache.getConnection).toHaveBeenCalledWith('inst-1');
      expect(mockLdapService.modifyUser).toHaveBeenCalledWith('testuser', userData);
      expect(mockK8sRepo.getK8sConfig).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should throw error when required parameters are missing', async () => {
      await expect(service.deleteUser('', 'gcp', 'cluster', 'region', 'user')).rejects.toThrow();
      await expect(service.deleteUser('inst-1', '' as any, 'cluster', 'region', 'user')).rejects.toThrow();
      await expect(service.deleteUser('inst-1', 'gcp', '', 'region', 'user')).rejects.toThrow();
      await expect(service.deleteUser('inst-1', 'gcp', 'cluster', '', 'user')).rejects.toThrow();
      await expect(service.deleteUser('inst-1', 'gcp', 'cluster', 'region', '')).rejects.toThrow();
    });

    it('should successfully delete user using cached connection', async () => {
      const mockLdapService = {
        listUsers: jest.fn(),
        createUser: jest.fn(),
        modifyUser: jest.fn(),
        deleteUser: jest.fn().mockResolvedValue(undefined),
      };
      const cachedConnection = {
        ldapService: mockLdapService as any,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-1',
        localPort: 8080,
      };

      mockConnectionCache.getConnection.mockReturnValue(cachedConnection);
      mockConnectionCache.validateConnection.mockResolvedValue(true);

      await service.deleteUser('inst-1', 'gcp', 'c-test', 'us-central1', 'testuser');

      expect(mockConnectionCache.getConnection).toHaveBeenCalledWith('inst-1');
      expect(mockLdapService.deleteUser).toHaveBeenCalledWith('testuser');
      expect(mockK8sRepo.getK8sConfig).not.toHaveBeenCalled();
    });
  });
});
