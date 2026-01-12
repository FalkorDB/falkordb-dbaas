import { LdapService } from '../../services/LdapService';

export interface IConnectionCacheRepository {
  getConnection(instanceId: string): CachedConnection | null;
  setConnection(instanceId: string, connection: CachedConnection): void;
  removeConnection(instanceId: string): void;
  clearExpired(): void;
  validateConnection(instanceId: string): Promise<boolean>;
}

export interface CachedConnection {
  ldapService: LdapService;
  close: () => void;
  createdAt: Date;
  instanceId: string;
  localPort: number;
}

export const IConnectionCacheRepository = {
  repositoryName: 'IConnectionCacheRepository',
};
