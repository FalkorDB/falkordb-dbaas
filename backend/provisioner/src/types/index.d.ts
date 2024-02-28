import { EnvSchemaType } from "../schemas/dotenv";

declare module "fastify" {
  export interface FastifyRequest {}
  export interface FastifyInstance {
    config: EnvSchemaType;
  }
}
