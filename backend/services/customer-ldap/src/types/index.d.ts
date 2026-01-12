import { EnvSchemaType } from '../schemas/dotenv';
declare module 'fastify' {
  export interface FastifyRequest { }
  export interface FastifyInstance {
    config: EnvSchemaType;
    authenticateOmnistrate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module '@fastify/request-context' { }
