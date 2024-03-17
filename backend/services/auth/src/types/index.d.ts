import { EnvSchemaType } from '../schemas/dotenv';
import { TObject, Static } from '@sinclair/typebox';
import { FalkorDBClient } from '@falkordb/rest-client';

declare module 'fastify' {
  export interface FastifyRequest {}
  export interface FastifyInstance {
    config: EnvSchemaType;
    falkordbClient: FalkorDBClient;
    pubsubDecode: <T>(request: FastifyRequest, schema?: TObject) => T;
  }
}

declare module '@fastify/request-context' {
  interface RequestContextData {
    organizationId: string;
    userId: string;
  }
}
