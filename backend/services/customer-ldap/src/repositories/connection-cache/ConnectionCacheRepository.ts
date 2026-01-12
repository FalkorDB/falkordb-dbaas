import { FastifyBaseLogger } from 'fastify';
import { IConnectionCacheRepository, CachedConnection } from './IConnectionCacheRepository';
import { SESSION_EXPIRY_MS, CACHE_CLEANUP_INTERVAL_MS } from '../../constants';
import axios from 'axios';
import * as https from 'https';

export class ConnectionCacheRepository implements IConnectionCacheRepository {
  private _cache: Map<string, CachedConnection> = new Map();
  private readonly CACHE_TTL = SESSION_EXPIRY_MS;
  private _cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private _options: { logger: FastifyBaseLogger }) {
    // Start cleanup interval (every 5 minutes)
    this._cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, CACHE_CLEANUP_INTERVAL_MS);
  }

  async validateConnection(instanceId: string): Promise<boolean> {
    const connection = this._cache.get(instanceId);
    
    if (!connection) {
      this._options.logger.debug({ instanceId }, 'No connection to validate');
      return false;
    }

    try {
      // Try to reach the port-forwarded LDAP server
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      await axios.get(`https://localhost:${connection.localPort}/api/v1/ca-certificate`, {
        httpsAgent,
        timeout: 3000,
      });

      this._options.logger.debug({ instanceId }, 'Connection is healthy');
      return true;
    } catch (error) {
      this._options.logger.warn({ instanceId, error: error instanceof Error ? error.message : 'Unknown error' }, 'Connection is unhealthy, removing from cache');
      this.removeConnection(instanceId);
      return false;
    }
  }

  getConnection(instanceId: string): CachedConnection | null {
    const connection = this._cache.get(instanceId);
    
    if (!connection) {
      this._options.logger.debug({ instanceId }, 'Connection cache miss');
      return null;
    }

    // Check if expired
    const age = Date.now() - connection.createdAt.getTime();
    if (age > this.CACHE_TTL) {
      this._options.logger.info({ instanceId, age }, 'Cached connection expired');
      this.removeConnection(instanceId);
      return null;
    }

    this._options.logger.debug({ instanceId }, 'Connection cache hit');
    return connection;
  }

  setConnection(instanceId: string, connection: CachedConnection): void {
    this._options.logger.info({ instanceId }, 'Caching connection');
    this._cache.set(instanceId, connection);
  }

  removeConnection(instanceId: string): void {
    const connection = this._cache.get(instanceId);
    if (connection) {
      this._options.logger.info({ instanceId }, 'Removing cached connection');
      try {
        connection.close();
      } catch (error) {
        this._options.logger.error({ error, instanceId }, 'Error closing cached connection');
      }
      this._cache.delete(instanceId);
    }
  }

  clearExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [instanceId, connection] of this._cache.entries()) {
      const age = now - connection.createdAt.getTime();
      if (age > this.CACHE_TTL) {
        this.removeConnection(instanceId);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this._options.logger.info({ expiredCount }, 'Cleared expired connections');
    }
  }

  destroy(): void {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }

    // Close all connections
    for (const instanceId of this._cache.keys()) {
      this.removeConnection(instanceId);
    }
  }
}
