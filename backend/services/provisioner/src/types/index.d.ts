import { EnvSchemaType } from '../schemas/dotenv';
import { RequestHeaderSchemaType } from '../schemas/request';
declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {
    config: EnvSchemaType;
    parseHeaders: (request: FastifyRequest, reply: FastifyReply, requiredHeaders?: string[]) => RequestHeaderSchemaType;
  }
}

declare module '@fastify/request-context' {
  interface RequestContextData {}
}
