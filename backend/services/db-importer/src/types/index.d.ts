import { EnvSchemaType } from '../schemas/dotenv';
import { TObject, Static } from '@sinclair/typebox';

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {
    config: EnvSchemaType;
    pubsubDecode: <T>(request: FastifyRequest, schema?: TObject) => T;
    validateCaptcha: (request: FastifyRequest) => Promise<void>;
  }
}

declare module '@fastify/request-context' {}
