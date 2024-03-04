import { EnvSchemaType } from '../schemas/dotenv';
import { RequestHeaderSchemaType } from '../schemas/request';
import { TObject, Static } from '@sinclair/typebox';

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {
    config: EnvSchemaType;
    parseHeaders: (request: FastifyRequest, reply: FastifyReply, requiredHeaders?: string[]) => RequestHeaderSchemaType;
    pubsubDecode: <T>(request: FastifyRequest, schema?: TObject) => T;
  }
}

declare module '@fastify/request-context' {
  interface RequestContextData {}
}
