import { QueueManager } from '../queues';
import { EnvSchemaType } from '../schemas/dotenv';
declare module 'fastify' {
  export interface FastifyRequest { }
  export interface FastifyInstance {
    config: EnvSchemaType;
    authenticateOmnistrate: (request: FastifyRequest) => Promise<void>;
    queueManager: QueueManager;
  }
}

declare module '@fastify/request-context' { }
