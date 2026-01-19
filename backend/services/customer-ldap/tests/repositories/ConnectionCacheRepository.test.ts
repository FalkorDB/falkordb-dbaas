import { ConnectionCacheRepository } from '../../src/repositories/connection-cache/ConnectionCacheRepository';
import pino from 'pino';

describe('ConnectionCacheRepository', () => {
  let repository: ConnectionCacheRepository;
  let logger: pino.Logger;

  beforeEach(() => {
    logger = pino({ level: 'silent' });
    repository = new ConnectionCacheRepository({ logger });
  });

  afterEach(() => {
    repository.destroy();
  });

  describe('getConnection', () => {
    it('should return null for non-existent connection', () => {
      const result = repository.getConnection('inst-123');
      expect(result).toBeNull();
    });

    it('should return cached connection', () => {
      const mockLdapService = {} as any;
      const connection = {
        ldapService: mockLdapService,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-123',
        localPort: 8080,
      };

      repository.setConnection('inst-123', connection);
      const result = repository.getConnection('inst-123');

      expect(result).toEqual(connection);
    });

    it('should return null for expired connection', () => {
      const mockLdapService = {} as any;
      const connection = {
        ldapService: mockLdapService,
        close: jest.fn(),
        createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        instanceId: 'inst-123',
        localPort: 8080,
      };

      repository.setConnection('inst-123', connection);
      const result = repository.getConnection('inst-123');

      expect(result).toBeNull();
      expect(connection.close).toHaveBeenCalled();
    });
  });

  describe('setConnection', () => {
    it('should cache connection', () => {
      const mockLdapService = {} as any;
      const connection = {
        ldapService: mockLdapService,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-123',
        localPort: 8080,
      };

      repository.setConnection('inst-123', connection);
      const result = repository.getConnection('inst-123');

      expect(result).toEqual(connection);
    });
  });

  describe('removeConnection', () => {
    it('should remove and close connection', () => {
      const mockLdapService = {} as any;
      const connection = {
        ldapService: mockLdapService,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-123',
        localPort: 8080,
      };

      repository.setConnection('inst-123', connection);
      repository.removeConnection('inst-123');

      expect(connection.close).toHaveBeenCalled();
      expect(repository.getConnection('inst-123')).toBeNull();
    });

    it('should handle removing non-existent connection', () => {
      expect(() => repository.removeConnection('inst-999')).not.toThrow();
    });
  });

  describe('clearExpired', () => {
    it('should remove expired connections', () => {
      const mockLdapService1 = {} as any;
      const mockLdapService2 = {} as any;
      const oldConnection = {
        ldapService: mockLdapService1,
        close: jest.fn(),
        createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        instanceId: 'inst-old',
        localPort: 8080,
      };

      const newConnection = {
        ldapService: mockLdapService2,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-new',
        localPort: 8080,
      };

      repository.setConnection('inst-old', oldConnection);
      repository.setConnection('inst-new', newConnection);

      repository.clearExpired();

      expect(oldConnection.close).toHaveBeenCalled();
      expect(repository.getConnection('inst-old')).toBeNull();
      expect(repository.getConnection('inst-new')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('should close all connections and clear interval', () => {
      const mockLdapService1 = {} as any;
      const mockLdapService2 = {} as any;
      const connection1 = {
        ldapService: mockLdapService1,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-1',
        localPort: 8080,
      };

      const connection2 = {
        ldapService: mockLdapService2,
        close: jest.fn(),
        createdAt: new Date(),
        instanceId: 'inst-2',
        localPort: 8080,
      };

      repository.setConnection('inst-1', connection1);
      repository.setConnection('inst-2', connection2);

      repository.destroy();

      expect(connection1.close).toHaveBeenCalled();
      expect(connection2.close).toHaveBeenCalled();
      expect(repository.getConnection('inst-1')).toBeNull();
      expect(repository.getConnection('inst-2')).toBeNull();
    });
  });
});
