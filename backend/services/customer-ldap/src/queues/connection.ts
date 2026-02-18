import * as IORedis from 'ioredis';
import { type EnvSchemaType } from '../schemas/dotenv';

export function createRedisConnection(config: EnvSchemaType): IORedis.Redis {
  return new IORedis.Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    db: config.REDIS_DB ?? 0,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false, // Required for BullMQ
  });
}
